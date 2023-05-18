# App Development steps with Freshworks Developer Copilot

Ensure you have the prerequisites available as mentioned in [getting_started guide](README.md)

1. From your terminal, create a new directory with app name
   ```sh
   mkdir your-app-name
   ```
2. Navigate to app directory
   ```sh
   cd your-app-name
   ```
3. Use FDK CLI to create an app with one of the app template when prompted
   ```sh
   fdk create
   ? Choose a product: `freshdesk`
   ? Choose a template: `your_first_app`
   A new Freshdesk app was successfully created from template "your_first_app" with the following files.
   ...
   ```
   you can Choose other product or templates as per your requirement
4. Open a new VS Code window and open newly created app folder from within it.
5. Use VS Code Plugin from within it to use the AI Copilot using the prompts as per [App Usecase document](USECASE.md)

## Important callouts

1. The model used in AI Copilot is being tuned and has following limitations
   1. The model doesn't persist the chat context, hence each query is treated as a new query
   2. The model doesn't use frequncy penalty, means you will continue to get same results when fired same query multiple times
   3. The query actions are passed through Freshworks custom querying mechanism with custom indexing, hence results would be different than that of the ChatGPT results
2. The model has legacy data from 2018 to 2022, which results some times in stale code snippets which might result in incositent or invalid code results which may not work with current platform version and recent changes