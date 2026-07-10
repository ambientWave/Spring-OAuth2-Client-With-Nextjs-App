# Authentication Workflow in Spring Security

This document explains the authentication workflow executed inside the code of this application. There are essentially three main workflows at play here:

### 1. The Core Security Setup ([SecurityConfig.java](./src/main/java/com/ambientwave/oauth2Client/security/SecurityConfig.java))
The `SecurityConfig` is the brain of the security setup. It establishes the rules for the workflows:
- It configures the app to be **Stateless** (`SessionCreationPolicy.STATELESS`), meaning the server won't store user sessions. Authentication must happen via tokens (JWTs) on each request.
- It permits open access to authentication routes (`/api/auth/**`, `/login`, `/register`, `/oauth2/**`) and requires authentication for all other requests.
- It registers a custom OAuth2 success handler and a custom JWT filter.

### 2. The OAuth2 Login Workflow ([OAuth2AuthenticationSuccessHandler.java](./src/main/java/com/ambientwave/oauth2Client/security/OAuth2AuthenticationSuccessHandler.java))
When a user clicks "Log in with GitHub/Google" on the frontend, they are redirected to the provider. Once they authenticate successfully, Spring Security intercepts the callback and triggers the custom success handler:
1. **Extraction:** It retrieves the user's `email`, `name`, and provider ID from the OAuth2 token.
2. **Database Sync:** It checks if the user exists in the `UserRepository`. If they don't, it creates a new `User` entity and saves them to the PostgreSQL database.
3. **JWT Generation:** It calls `jwtUtil.generateToken(user.getEmail())` to create a JWT representing the authenticated user.
4. **Cookie Assignment:** It wraps the JWT inside an `HttpOnly` cookie. This is a very secure practice because the cookie cannot be accessed by client-side JavaScript, protecting it against XSS attacks.
5. **Redirection:** Finally, it redirects the user back to the frontend (`http://localhost:3000/en`).

### 3. The Local Login/Register Workflow ([AuthController.java](./src/main/java/com/ambientwave/oauth2Client/controllers/AuthController.java))
If a user chooses to log in or register with an email and password instead of OAuth2:
- **Registration (`/register`):** The app verifies the email isn't taken, hashes the password using `BCryptPasswordEncoder`, and saves the user as a "local" provider.
- **Login (`/login`):** The app authenticates the user using Spring's `AuthenticationManager`. If successful, it generates a JWT and returns it in an `HttpOnly` cookie, just like the OAuth2 workflow.
- **Logout (`/logout`):** The app invalidates the session by returning a new cookie with the same name (`jwt`), but with a `null` value and a `MaxAge` of `0`, effectively deleting the token from the user's browser.

### 4. Authenticating Subsequent API Requests ([JwtAuthenticationFilter.java](./src/main/java/com/ambientwave/oauth2Client/security/JwtAuthenticationFilter.java))
Once the user has the JWT cookie (either from OAuth2 or Local login), they can access protected endpoints. This workflow runs on **every single request**:
1. **Interception:** Before the request reaches the controllers, `JwtAuthenticationFilter` (which extends `OncePerRequestFilter`) intercepts it.
2. **Token Retrieval:** It looks for a cookie named `jwt`. (It also has a fallback to check the `Authorization: Bearer` header).
3. **Validation:** If a token is found, it extracts the username (email) and validates the token using `jwtUtil.validateToken()`.
4. **Context Population:** If the token is valid, it creates an `UsernamePasswordAuthenticationToken` and injects it into the `SecurityContextHolder`. 
5. **Execution:** Because the `SecurityContextHolder` is now populated, Spring Security knows who the user is and allows the request to pass through to the protected API endpoints.
