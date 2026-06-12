## UI Reference Migration

There is a `ui-reference/` folder containing the Bolt-generated mockup project.

Use `ui-reference/` as the visual/design source of truth only.

The real app remains the source of truth for:

- business logic
- API calls
- authentication
- authorization
- validation
- routing
- permissions
- state management
- error handling
- loading behavior

Do not copy mock data from `ui-reference/`.

When replacing reusable components, preserve the real app’s props, data flow, handlers, permissions, and API integrations.

Create and maintain `DESIGN.md` to document the design system extracted from `ui-reference/`.
