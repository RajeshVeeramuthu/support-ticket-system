namespace SupportTicket.Api.Models;

public static class UserRoles
{
    public const string User = "USER";
    public const string Agent = "AGENT";
    public const string Admin = "ADMIN";
}

public class AppUser
{
    public int Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = UserRoles.User;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Ticket> CreatedTickets { get; set; } = new List<Ticket>();

    public ICollection<Ticket> AssignedTickets { get; set; } = new List<Ticket>();

    public ICollection<TicketComment> Comments { get; set; } = new List<TicketComment>();
}