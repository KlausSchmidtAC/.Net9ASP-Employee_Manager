using System.Text.Json.Serialization;
using Domain;
using WebAPI_NET9.Models;

namespace WebAPI_NET9;

[JsonSerializable(typeof(List<Domain.Employee>))]
[JsonSerializable(typeof(IEnumerable<Domain.Employee>))]
[JsonSerializable(typeof(Domain.Employee))]
[JsonSerializable(typeof(Domain.Employee[]))]
[JsonSerializable(typeof(OperationResult))]
[JsonSerializable(typeof(Domain.TokenGenerationRequest))]
[JsonSerializable(typeof(HealthCheckResponse))]
[JsonSerializable(typeof(HealthCheckEntry[]))]

 public partial class AppJsonSerializerContext : JsonSerializerContext
{
}
