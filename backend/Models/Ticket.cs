namespace SupportTicket.Api.Models;

public static class TicketStatuses
{
    public const string Open = "OPEN";
    public const string InProgress = "IN_PROGRESS";
    public const string Resolved = "RESOLVED";
    public const string Closed = "CLOSED";
}

public static class TicketCategories
{
    public const string Technical = "Technical";
    public const string Billing = "Billing";
    public const string Account = "Account";
    public const string Access = "Access";
    public const string Other = "Other";
}

public static class TicketSeverities
{
    public const string High = "HIGH";
    public const string Normal = "NORMAL";
}

public class Ticket
{
    public int Id { get; set; }

    public string Subject { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = TicketCategories.Other;

    public string Severity { get; set; } = TicketSeverities.Normal;

    public string Status { get; set; } = TicketStatuses.Open;

    public int CreatedById { get; set; }

    public AppUser CreatedBy { get; set; } = null!;

    public int? AssignedAgentId { get; set; }

    public AppUser? AssignedAgent { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ResolvedAt { get; set; }

    public ICollection<TicketComment> Comments { get; set; } = new List<TicketComment>();
}