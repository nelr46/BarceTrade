namespace BarcTradeAPI.Models
{
    public class User
{
    public int user_id { get; set; }
    public required string name { get; set; }
    public required string email { get; set; }
    public required string password { get; set; }
    public DateTime? birthdate { get; set; }  // Garantir que é anulável
    public bool moderator { get; set; }
    public int postalcode_id { get; set; }
}

}