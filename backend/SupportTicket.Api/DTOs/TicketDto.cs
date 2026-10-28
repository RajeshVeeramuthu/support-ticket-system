using System.ComponentModel.DataAnnotations;

namespace SupportTicket.Api.DTOs;

public record CreateTicketRequest(
    [Required, StringLength(200, MinimumLength = 3)] string Subject,
    [Required, StringLength(10000, MinimumLength = 5)] string Description,
    [Required] string Category
);

public record UpdateTicketStatusRequest(
    [Required] string Status
);

public record AssignTicketRequest(
    [Required] int AgentId
);

public record TicketResponse(
    int Id,
    string Subject,
    string Description,
    string Category,
    string Severity,
    string Status,
    int CreatedById,
    string CreatedByName,
    int? AssignedAgentId,
    string? AssignedAgentName,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? ResolvedAt
);

public record AgentResponse(
    int Id,
    string FullName,
    string Email,
    int ActiveTicketCount
);

public record DashboardResponse(
    int TotalTickets,
    int OpenTickets,
    int InProgressTickets,
    int ResolvedTickets,
    int ClosedTickets,
    int HighSeverityTickets,
    int UnassignedTickets
);