# ELYON template — `Result<T>` + `ProblemDetails`

Este template define um contrato único para erros de domínio/autorização/validação no backend e consumo no front.

## 1) Error codes (fonte de verdade no backend)

```csharp
public static class ErrorCodes
{
    // 403
    public const string ForbiddenRoleRequired = "FORBIDDEN_ROLE_REQUIRED";
    public const string ForbiddenPermissionRequired = "FORBIDDEN_PERMISSION_REQUIRED";

    // 409
    public const string RoleNameAlreadyExists = "ROLE_NAME_ALREADY_EXISTS";
    public const string UserEmailAlreadyExists = "USER_EMAIL_ALREADY_EXISTS";
    public const string ConcurrencyConflict = "CONCURRENCY_CONFLICT";

    // 422
    public const string LastAdminRoleCannotBeDisabled = "LAST_ADMIN_ROLE_CANNOT_BE_DISABLED";
    public const string DefaultTenantChangeNotAllowed = "DEFAULT_TENANT_CHANGE_NOT_ALLOWED";
    public const string InvalidRoleStateTransition = "INVALID_ROLE_STATE_TRANSITION";

    // 400
    public const string ValidationError = "VALIDATION_ERROR";
}
```

## 2) `Result<T>`

```csharp
public sealed class Result<T>
{
    public bool Success { get; private set; }
    public T? Data { get; private set; }
    public string? ErrorCode { get; private set; }
    public string? Message { get; private set; }
    public int? StatusCode { get; private set; }

    public static Result<T> Ok(T data)
        => new() { Success = true, Data = data };

    public static Result<T> Fail(string errorCode, string message, int statusCode)
        => new()
        {
            Success = false,
            ErrorCode = errorCode,
            Message = message,
            StatusCode = statusCode
        };
}
```

## 3) Extension para converter erro em `ProblemDetails`

```csharp
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

public static class ResultProblemExtensions
{
    public static IActionResult ToProblem<T>(this ControllerBase controller, Result<T> result)
    {
        if (result.Success)
        {
            return controller.Ok(result.Data);
        }

        return controller.Problem(
            title: result.ErrorCode ?? ErrorCodes.ValidationError,
            detail: result.Message ?? "Can not be performed.",
            statusCode: result.StatusCode ?? StatusCodes.Status400BadRequest,
            extensions: new Dictionary<string, object?>
            {
                ["traceId"] = controller.HttpContext.TraceIdentifier,
                ["timestamp"] = DateTimeOffset.UtcNow
            }
        );
    }
}
```

## 4) Exemplo de serviço (domínio)

```csharp
public async Task<Result<RoleDto>> UpdateRoleAsync(Guid id, UpdateRoleRequest request, CurrentUser user)
{
    if (!user.HasRole("Admin"))
    {
        return Result<RoleDto>.Fail(
            ErrorCodes.ForbiddenRoleRequired,
            "You need Admin role to update roles.",
            StatusCodes.Status403Forbidden
        );
    }

    var existingName = await _roleRepository.ExistsByNameAsync(request.Name, id);
    if (existingName)
    {
        return Result<RoleDto>.Fail(
            ErrorCodes.RoleNameAlreadyExists,
            "A role with this name already exists.",
            StatusCodes.Status409Conflict
        );
    }

    var role = await _roleRepository.GetByIdAsync(id);
    if (role is null)
    {
        return Result<RoleDto>.Fail(
            "ROLE_NOT_FOUND",
            "Role not found.",
            StatusCodes.Status404NotFound
        );
    }

    if (role.IsLastActiveAdmin && request.IsActive == false)
    {
        return Result<RoleDto>.Fail(
            ErrorCodes.LastAdminRoleCannotBeDisabled,
            "At least one active admin role is required.",
            StatusCodes.Status422UnprocessableEntity
        );
    }

    // ... update
    return Result<RoleDto>.Ok(new RoleDto(/* ... */));
}
```

## 5) Exemplo de controller

```csharp
[HttpPut("{id:guid}")]
public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoleRequest request)
{
    var result = await _roleService.UpdateRoleAsync(id, request, CurrentUser);

    if (!result.Success)
        return this.ToProblem(result);

    return Ok(result.Data);
}
```

## 6) Exemplos de payload retornado

### 403 — falta role

```json
{
  "type": "about:blank",
  "title": "FORBIDDEN_ROLE_REQUIRED",
  "status": 403,
  "detail": "You need Admin role to update roles.",
  "traceId": "00-31f8...",
  "timestamp": "2026-02-28T18:22:10.115Z"
}
```

### 409 — conflito de unicidade

```json
{
  "type": "about:blank",
  "title": "ROLE_NAME_ALREADY_EXISTS",
  "status": 409,
  "detail": "A role with this name already exists.",
  "traceId": "00-c9e2...",
  "timestamp": "2026-02-28T18:24:01.391Z"
}
```

### 422 — regra de negócio

```json
{
  "type": "about:blank",
  "title": "LAST_ADMIN_ROLE_CANNOT_BE_DISABLED",
  "status": 422,
  "detail": "At least one active admin role is required.",
  "traceId": "00-d3aa...",
  "timestamp": "2026-02-28T18:24:55.008Z"
}
```

## 7) Front-end (consumo esperado)

- Para `403`, o interceptor pode emitir evento de permissão e o app abrir modal/contexto de acesso.
- Para `400/409/422`, extrair mensagem via parser (`title/detail/errors`) e tentar tradução por chave `apiErrors.<ERROR_CODE>`.
- Fallback de mensagem quando não houver tradução: `detail` > `message` > `title` > mensagem padrão.

## 8) Catálogo PT/ES/EN sugerido

| ErrorCode | HTTP | PT | ES | EN |
|---|---:|---|---|---|
| FORBIDDEN_ROLE_REQUIRED | 403 | Você não tem perfil para executar esta ação. | No tienes el rol necesario para ejecutar esta acción. | You don’t have the required role to perform this action. |
| FORBIDDEN_PERMISSION_REQUIRED | 403 | Você não tem permissão para executar esta ação. | No tienes permiso para ejecutar esta acción. | You don’t have permission to perform this action. |
| ROLE_NAME_ALREADY_EXISTS | 409 | Já existe uma role com este nome. | Ya existe un rol con este nombre. | A role with this name already exists. |
| USER_EMAIL_ALREADY_EXISTS | 409 | Já existe um usuário com este e-mail. | Ya existe un usuario con este correo. | A user with this email already exists. |
| CONCURRENCY_CONFLICT | 409 | Este registro foi alterado por outro usuário. Atualize e tente novamente. | Este registro fue modificado por otro usuario. Actualiza e inténtalo de nuevo. | This record was changed by another user. Refresh and try again. |
| LAST_ADMIN_ROLE_CANNOT_BE_DISABLED | 422 | Não é possível desativar o último perfil administrador ativo. | No se puede desactivar el último rol administrador activo. | Cannot disable the last active administrator role. |
| DEFAULT_TENANT_CHANGE_NOT_ALLOWED | 422 | Não é permitido alterar o tenant padrão nesta operação. | No se permite cambiar el tenant predeterminado en esta operación. | Changing the default tenant is not allowed in this operation. |
| INVALID_ROLE_STATE_TRANSITION | 422 | Transição de estado da role inválida. | Transición de estado del rol inválida. | Invalid role state transition. |
| VALIDATION_ERROR | 400 | Há campos inválidos no formulário. | Hay campos inválidos en el formulario. | There are invalid fields in the form. |
