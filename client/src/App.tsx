import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { queryClient } from "./lib/queryClient";
import AppBar from "./components/layout/AppBar";
import URLShortenerPage from "./pages/url-shortener";
import StatisticsPage from "./pages/statistics";
import RedirectTestPage from "./pages/redirect-test";
import RedirectHandler from "./pages/redirect-handler";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#fafafa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 4,
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={URLShortenerPage} />
      <Route path="/stats" component={StatisticsPage} />
      <Route path="/redirect-test" component={RedirectTestPage} />
      <Route path="/:shortCode" component={RedirectHandler} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="fade-in">
          <AppBar />
          <div className="mui-container">
            <Router />
          </div>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
