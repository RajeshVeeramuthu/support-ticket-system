using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupportTicket.Api.Data;
using SupportTicket.Api.DTOs;
using SupportTicket.Api.Models;

namespace SupportTicket.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardResponse>> GetStats()
    {
        var tickets = db.Tickets.AsQueryable();

        if (User.IsInRole(UserRoles.Agent))
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            tickets = tickets.Where(ticket => ticket.AssignedAgentId == userId);
        }
        else if (!User.IsInRole(UserRoles.Admin))
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            tickets = tickets.Where(ticket => ticket.CreatedById == userId);
        }

        var stats = await tickets
            .GroupBy(_ => 1)
            .Select(group => new DashboardResponse(
                group.Count(),
                group.Count(ticket => ticket.Status == TicketStatuses.Open),
                group.Count(ticket => ticket.Status == TicketStatuses.InProgress),
                group.Count(ticket => ticket.Status == TicketStatuses.Resolved),
                group.Count(ticket => ticket.Status == TicketStatuses.Closed),
                group.Count(ticket => ticket.Severity == TicketSeverities.High),
                group.Count(ticket => ticket.AssignedAgentId == null)
            ))
            .SingleOrDefaultAsync();

        return Ok(stats ?? new DashboardResponse(0, 0, 0, 0, 0, 0, 0));
    }
}