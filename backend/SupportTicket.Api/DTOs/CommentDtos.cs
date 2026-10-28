using System.ComponentModel.DataAnnotations;

namespace SupportTicket.Api.DTOs;

public record CreateCommentRequest(
    [Required, StringLength(5000, MinimumLength = 1)] string Message
);

public record CommentResponse(
    int Id,
    int TicketId,
    int UserId,
    string UserName,
    string Message,
    DateTime CreatedAt
);