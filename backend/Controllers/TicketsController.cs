using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupportTicket.Api.Data;
using SupportTicket.Api.DTOs;
using SupportTicket.Api.Models;
using SupportTicket.Api.Services;

namespace SupportTicket.Api.Controllers;

[ApiController]
[Route("api/tickets")]
[Authorize]
public class TicketsController(
    AppDbContext db,
    TicketService ticketService) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsAdmin =>
        User.IsInRole(UserRoles.Admin);

    private bool IsAgent =>
        User.IsInRole(UserRoles.Agent);

    private IQueryable<Ticket> VisibleTickets()
    {
        var query = db.Tickets.AsQueryable();

        if (IsAdmin)
            return query;

        if (IsAgent)
            return query.Where(t => t.AssignedAgentId == CurrentUserId);

        return query.Where(t => t.CreatedById == CurrentUserId);
    }

    private static TicketResponse ToResponse(Ticket t) =>
        new(
            t.Id,
            t.Subject,
            t.Description,
            t.Category,
            t.Severity,
            t.Status,
            t.CreatedById,
            t.CreatedBy.FullName,
            t.AssignedAgentId,
            t.AssignedAgent == null ? null : t.AssignedAgent.FullName,
            t.CreatedAt,
            t.UpdatedAt,
            t.ResolvedAt
        );

    // GET /api/tickets?status=OPEN&search=password&page=1&pageSize=10
    [HttpGet]
    public async Task<ActionResult> GetTickets(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = VisibleTickets()
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedAgent)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(t => t.Status == status.Trim().ToUpperInvariant());

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(t =>
                EF.Functions.ILike(t.Subject, $"%{term}%") ||
                EF.Functions.ILike(t.Description, $"%{term}%"));
        }

        var totalCount = await query.CountAsync();

        var tickets = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new
        {
            items = tickets.Select(ToResponse),
            totalCount,
            page,
            pageSize
        });
    }

    // GET /api/tickets/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TicketResponse>> GetTicket(int id)
    {
        var ticket = await VisibleTickets()
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedAgent)
            .SingleOrDefaultAsync(t => t.Id == id);

        if (ticket is null)
            return NotFound(new { message = "Ticket not found." });

        return Ok(ToResponse(ticket));
    }

    // POST /api/tickets
    [HttpPost]
    [Authorize(Roles = UserRoles.User)]
    public async Task<ActionResult<TicketResponse>> CreateTicket(
        CreateTicketRequest request)
    {
        var allowedCategories = new[]
        {
            TicketCategories.Technical,
            TicketCategories.Billing,
            TicketCategories.Account,
            TicketCategories.Access,
            TicketCategories.Other
        };

        var category = allowedCategories.FirstOrDefault(
            c => c.Equals(request.Category.Trim(),
                StringComparison.OrdinalIgnoreCase));

        if (category is null)
            return BadRequest(new { message = "Invalid ticket category." });

        var agentId = await ticketService.FindLeastLoadedAgentIdAsync();

        var ticket = new Ticket
        {
            Subject = request.Subject.Trim(),
            Description = request.Description.Trim(),
            Category = category,
            Severity = TicketService.CalculateSeverity(
                request.Subject, request.Description),
            Status = TicketStatuses.Open,
            CreatedById = CurrentUserId,
            AssignedAgentId = agentId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Tickets.Add(ticket);
        await db.SaveChangesAsync();

        await db.Entry(ticket).Reference(t => t.CreatedBy).LoadAsync();

        if (ticket.AssignedAgentId is not null)
            await db.Entry(ticket).Reference(t => t.AssignedAgent).LoadAsync();

        return CreatedAtAction(
            nameof(GetTicket),
            new { id = ticket.Id },
            ToResponse(ticket)
        );
    }

    // PATCH /api/tickets/5/status
    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = UserRoles.Agent + "," + UserRoles.Admin)]
    public async Task<ActionResult<TicketResponse>> UpdateStatus(
        int id,
        UpdateTicketStatusRequest request)
    {
        var ticket = await db.Tickets
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedAgent)
            .SingleOrDefaultAsync(t => t.Id == id);

        if (ticket is null)
            return NotFound(new { message = "Ticket not found." });

        if (!IsAdmin && ticket.AssignedAgentId != CurrentUserId)
            return Forbid();

        var newStatus = request.Status.Trim().ToUpperInvariant();

        var allowedStatuses = new[]
        {
            TicketStatuses.Open,
            TicketStatuses.InProgress,
            TicketStatuses.Resolved,
            TicketStatuses.Closed
        };

        if (!allowedStatuses.Contains(newStatus))
            return BadRequest(new { message = "Invalid ticket status." });

        ticket.Status = newStatus;
        ticket.UpdatedAt = DateTime.UtcNow;

        if (newStatus == TicketStatuses.Resolved)
            ticket.ResolvedAt = DateTime.UtcNow;
        else if (newStatus == TicketStatuses.Open ||
                 newStatus == TicketStatuses.InProgress)
            ticket.ResolvedAt = null;

        await db.SaveChangesAsync();

        return Ok(ToResponse(ticket));
    }

    // POST /api/tickets/5/assign
    [HttpPost("{id:int}/assign")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult<TicketResponse>> AssignTicket(
        int id,
        AssignTicketRequest request)
    {
        var ticket = await db.Tickets
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedAgent)
            .SingleOrDefaultAsync(t => t.Id == id);

        if (ticket is null)
            return NotFound(new { message = "Ticket not found." });

        var agent = await db.Users.SingleOrDefaultAsync(u =>
            u.Id == request.AgentId &&
            u.Role == UserRoles.Agent &&
            u.IsActive);

        if (agent is null)
            return BadRequest(new { message = "Active agent not found." });

        ticket.AssignedAgentId = agent.Id;
        ticket.AssignedAgent = agent;
        ticket.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return Ok(ToResponse(ticket));
    }

    // GET /api/tickets/agents
    [HttpGet("agents")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult> GetAgents()
    {
        var agents = await db.Users
            .Where(u => u.Role == UserRoles.Agent && u.IsActive)
            .OrderBy(u => u.FullName)
            .Select(u => new AgentResponse(
                u.Id,
                u.FullName,
                u.Email,
                db.Tickets.Count(t =>
                    t.AssignedAgentId == u.Id &&
                    (t.Status == TicketStatuses.Open ||
                     t.Status == TicketStatuses.InProgress))
            ))
            .ToListAsync();

        return Ok(agents);
    }
}