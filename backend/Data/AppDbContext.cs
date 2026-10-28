using Microsoft.EntityFrameworkCore;
using SupportTicket.Api.Models;

namespace SupportTicket.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();

    public DbSet<Ticket> Tickets => Set<Ticket>();

    public DbSet<TicketComment> TicketComments => Set<TicketComment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.FullName).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(256).IsRequired();
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.Role).HasMaxLength(20).IsRequired();
            entity.Property(x => x.PasswordHash).IsRequired();
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Subject).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Description).IsRequired();
            entity.Property(x => x.Category).HasMaxLength(30).IsRequired();
            entity.Property(x => x.Severity).HasMaxLength(10).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(20).IsRequired();

            entity.HasOne(x => x.CreatedBy)
                .WithMany(x => x.CreatedTickets)
                .HasForeignKey(x => x.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.AssignedAgent)
                .WithMany(x => x.AssignedTickets)
                .HasForeignKey(x => x.AssignedAgentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(x => new { x.Status, x.AssignedAgentId });
            entity.HasIndex(x => x.CreatedById);
        });

        modelBuilder.Entity<TicketComment>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Message).HasMaxLength(5000).IsRequired();

            entity.HasOne(x => x.Ticket)
                .WithMany(x => x.Comments)
                .HasForeignKey(x => x.TicketId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.User)
                .WithMany(x => x.Comments)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}