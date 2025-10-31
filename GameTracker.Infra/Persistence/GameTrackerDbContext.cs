using GameTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GameTracker.Infra.Persistence
{
    public class GameTrackerDbContext : DbContext
    {
        public GameTrackerDbContext(DbContextOptions<GameTrackerDbContext> options)
        : base(options)
        {
        }

        public DbSet<Jogo> Jogos => Set<Jogo>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Jogo>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Titulo).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Plataforma).HasMaxLength(50);
                entity.Property(e => e.Genero).HasMaxLength(50);

                entity.Property(e => e.Nota)
                       .HasPrecision(4, 2); // Exemplo: 9.75
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
