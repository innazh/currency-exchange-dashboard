# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## To run:
You can open two terminal windows and run npm run dev in one to start the front end, and npm run api in the other to start the back end.

# Features completed:
## General Features
- ✔️ Utilize the Frankfurter API to fetch historical currency exchange rate data.
- ✔️ Render the fetched data in a chart using Chart.js.
- ✔️ Render the fetched data in a table using ag-Grid with filtering. Persist grid settings on refresh.
- ✔️ The ability to show one or multiple currencies in the charts.
## Optional Features – Not Required
- ✔️ Implement functionality to save API call data to a database for future use. So, an API call is not required to use the Frankfurter API each time.
- Setup a function - this doesn’t have to be functional but in theory would run on the first of each month and add the new exchange rate data for the previous month.
- Any additional features or improvements you believe would enhance the dashboard functionality or user experience.