using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupportTicket.Api.Data;
using SupportTicket.Api.DTOs;
using SupportTicket.Api.Models;

namespace SupportTicket.Api.Controllers;

[ApiController]
[Route("api/tickets/{ticketId:int}/comments")]
[Authorize]
public class CommentsController(AppDbContext db) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private async Task<Ticket?> FindVisibleTicket(int ticketId)
    {
        var query = db.Tickets.AsQueryable();

        if (User.IsInRole(UserRoles.Admin))
        {
            // Admin can access every ticket.
        }
        else if (User.IsInRole(UserRoles.Agent))
        {
            query = query.Where(t => t.AssignedAgentId == CurrentUserId);
        }
        else
        {
            query = query.Where(t => t.CreatedById == CurrentUserId);
        }

        return await query.SingleOrDefaultAsync(t => t.Id == ticketId);
    }

    [HttpGet]
    public async Task<ActionResult> GetComments(int ticketId)
    {
        var ticket = await FindVisibleTicket(ticketId);

        if (ticket is null)
            return NotFound(new { message = "Ticket not found." });

        var comments = await db.TicketComments
            .Where(c => c.TicketId == ticketId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CommentResponse(
                c.Id,
                c.TicketId,
                c.UserId,
                c.User.FullName,
                c.Message,
                c.CreatedAt))
            .ToListAsync();

        return Ok(comments);
    }

    [HttpPost]
    public async Task<ActionResult<CommentResponse>> AddComment(
        int ticketId,
        CreateCommentRequest request)
    {
        var ticket = await FindVisibleTicket(ticketId);

        if (ticket is null)
            return NotFound(new { message = "Ticket not found." });

        if (ticket.Status == TicketStatuses.Closed)
            return Conflict(new { message = "Closed tickets cannot receive comments." });

        var message = request.Message.Trim();

        if (message.Length == 0)
            return BadRequest(new { message = "Comment cannot be empty." });

        var comment = new TicketComment
        {
            TicketId = ticketId,
            UserId = CurrentUserId,
            Message = message,
            CreatedAt = DateTime.UtcNow
        };

        db.TicketComments.Add(comment);
        await db.SaveChangesAsync();

        var userName = await db.Users
            .Where(u => u.Id == CurrentUserId)
            .Select(u => u.FullName)
            .SingleAsync();

        return Ok(new CommentResponse(
            comment.Id,
            comment.TicketId,
            comment.UserId,
            userName,
            comment.Message,
            comment.CreatedAt
        ));
    }
}