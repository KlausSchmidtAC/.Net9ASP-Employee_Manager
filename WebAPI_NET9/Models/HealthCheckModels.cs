namespace WebAPI_NET9.Models;

/// <summary>
/// Represents a single health check entry in the health check response.
/// </summary>
public record HealthCheckEntry(
    string Name,
    string Status,
    double Duration,
    string? Description,
    IReadOnlyDictionary<string, object> Data,
    string? Exception,
    IEnumerable<string> Tags);

/// <summary>
/// Represents the full health check response returned by /health endpoint.
/// </summary>
public record HealthCheckResponse(
    string Status,
    double TotalDuration,
    HealthCheckEntry[] Checks);
