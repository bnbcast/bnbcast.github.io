import { githubProfileUrl, portfolioUrl, projectsUrl } from "./siteConfig.js";
import "./breadcrumb.css";

export default function Breadcrumb({ current }) {
  return (
    <div className="site-breadcrumb" role="navigation" aria-label="Breadcrumb">
      <a href={portfolioUrl}>Portfolio</a>
      <span className="site-breadcrumb__separator" aria-hidden="true">
        /
      </span>
      <a href={projectsUrl}>Projects</a>
      <span className="site-breadcrumb__separator" aria-hidden="true">
        /
      </span>
      <span aria-current="page">{current}</span>
      <a
        className="site-breadcrumb__github"
        href={githubProfileUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
    </div>
  );
}
