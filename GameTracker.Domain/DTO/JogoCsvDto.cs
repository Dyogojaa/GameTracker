namespace GameTracker.Domain.DTO
{
    public class JogoCsvDto
    {
        public string Title { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public string? Backlog { get; set; }
        public string? Completed { get; set; }
        public string? CompletionDate { get; set; }
        public string? Review { get; set; }          // nota no CSV (pode vir como "9.5" ou "9")
        public string? ReviewNotes { get; set; }     // notas do review / comentários (se existir)
        public string? MainStory { get; set; }
        public string? MainExtras { get; set; }
        public string? Completionist { get; set; }
        public string? Storefront { get; set; }

        public string? LastUpdated { get; set; } // opcional (caso tenha 2 datas)
    }
}
