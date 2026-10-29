const env = import.meta.env;

export const portfolioUrl = env.VITE_PORTFOLIO_URL || "/";
export const projectsUrl = `${portfolioUrl.replace(/\/?$/, "/")}#projects`;
export const githubUsername = env.VITE_GITHUB_USERNAME || "bnbcast";
export const githubProfileUrl = `https://github.com/${githubUsername}`;
