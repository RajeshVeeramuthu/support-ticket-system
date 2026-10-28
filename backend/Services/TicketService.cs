using Microsoft.EntityFrameworkCore;
using SupportTicket.Api.Data;
using SupportTicket.Api.Models;

namespace SupportTicket.Api.Services;

public class TicketService(AppDbContext db)
{
    public static string CalculateSeverity(string subject, string description)
    {
        var text = $"{subject} {description}".ToLowerInvariant();

        string[] highSeverityKeywords =
        [
            "urgent",
            "critical",
            "system down",
            "data loss",
            "security breach",
            "cannot access",
            "production down"
        ];

        return highSeverityKeywords.Any(text.Contains)
            ? TicketSeverities.High
            : TicketSeverities.Normal;
    }

    public async Task<int?> FindLeastLoadedAgentIdAsync(
        CancellationToken cancellationToken = default)
    {
        var activeAgents = await db.Users
            .Where(u => u.Role == UserRoles.Agent && u.IsActive)
            .Select(u => new
            {
                u.Id,
                ActiveCount = db.Tickets.Count(t =>
                    t.AssignedAgentId == u.Id &&
                    (t.Status == TicketStatuses.Open ||
                     t.Status == TicketStatuses.InProgress))
            })
            .OrderBy(x => x.ActiveCount)
            .ThenBy(x => x.Id)
            .ToListAsync(cancellationToken);

        return activeAgents.FirstOrDefault()?.Id;
    }
}