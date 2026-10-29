import { useEffect, useMemo, useRef, useState } from "react";
import {
  githubProfileUrl,
  githubUsername,
} from "./shared/siteConfig.js";

const CONFIG = {
  name: "Zaky Azhari",
  role: "Junior Developer",
  headline: "I build practical tools—and show how they work.",
  pitch:
    "Software engineering graduate building interactive browser demos, scheduling tools, and engineering explainers. This portfolio and its five project showcases are built with React 19 and Vite 6. I care about clear interfaces, useful logic, and honest demos you can try.",
  status: "Open to junior software and technical roles",
  accent: "#7c8cff",
  theme: "dark",
  liveThumbs: true,
  activity: { username: githubUsername, max: 6 },
  sections: ["projects", "activity", "skills", "about", "contact"],
  links: {
    github: githubProfileUrl,
    linkedin: "",
    email: "zakyazhari393@gmail.com",
  },
  projects: [
    {
      featured: true,
      title: "Inference Time Calculator",
      problem:
        "Works out how many parallel AI attempts you need for at least one to fix a bug, with every step of the math shown.",
      stack: ["JavaScript", "Probability", "Data viz"],
      repo: "https://github.com/bnbcast/InferenceTimeCalc",
      image: "",
      demo: {
        type: "iframe",
        url: "https://bnbcast.github.io/InferenceTimeCalc/",
      },
    },
    {
      featured: true,
      title: "Word Detective",
      problem:
        "Ranks the words that give away AI-written text by comparing word frequencies against human answers, using Laplace smoothing.",
      stack: ["JavaScript", "Statistics", "Data viz"],
      repo: "https://github.com/bnbcast/Word-Detective",
      image: "",
      demo: {
        type: "iframe",
        url: "https://bnbcast.github.io/Word-Detective/",
      },
    },
    {
      featured: true,
      title: "Preventive Maintenance Scheduler",
      problem:
        "Moves an Excel-based preventive maintenance cycle onto the web, with an asset register, load view and a read-only CLI-style demo. In English and Indonesian.",
      stack: ["JavaScript", "Scheduling", "EN/ID i18n"],
      repo: "https://github.com/bnbcast/JadwalTahunan-PM",
      image: "",
      demo: {
        type: "iframe",
        url: "https://bnbcast.github.io/JadwalTahunan-PM/",
      },
    },
    {
      featured: true,
      title: "MPU-6050 + ESP32 Motion Lab",
      problem:
        "Explore a virtual MPU-6050 in 3D, rotate and shake the board, inspect simulated accelerometer and gyroscope readings, and learn how the ESP32 sensor sketch and separate Control Center fit together.",
      stack: ["JavaScript", "Three.js", "ESP32", "Sensor simulation"],
      repo: "https://github.com/bnbcast/MPU6050",
      image: "",
      demo: {
        type: "iframe",
        url: "https://bnbcast.github.io/MPU6050/",
      },
    },
    {
      title: "Autodesk Inventor Part Showcase",
      problem:
        "A showcase page for a part I modelled while learning Autodesk Inventor, with sketch, features and specs.",
      stack: ["Autodesk Inventor", "CAD", "JavaScript"],
      repo: "https://github.com/bnbcast/2d-inventor",
      image: "",
      demo: {
        type: "iframe",
        url: "https://bnbcast.github.io/2d-inventor/",
      },
    },
  ],
  skills: {
    "Languages & web": ["JavaScript", "HTML & CSS", "Python", "C++"],
    "Frameworks & build tools": ["React 19", "Vite 6", "npm"],
    Concepts: [
      "Probability & statistics",
      "Data visualization",
      "Scheduling logic",
      "3D visualization",
      "Sensor simulation",
      "Embedded systems basics",
    ],
    "Tools & platforms": [
      "Git & GitHub",
      "GitHub Pages",
      "VS Code",
      "Three.js",
      "ESP32 / Arduino",
      "Autodesk Inventor",
    ],
  },
  about: [
    "I'm a software engineering graduate who enjoys turning practical problems into small, usable tools. My projects range from scheduling and statistical explainers to interactive 3D simulations and embedded-system dashboards.",
    "I focus on making the underlying logic understandable: a useful demo should be interactive, explain its assumptions, and make clear what's simulated versus connected to real hardware.",
  ],
  learning:
    "Currently learning: C++ and Python, embedded systems, and interactive browser-based visualization.",
};

const PROJECT_LIMIT = 6;

function getInitialTheme() {
  try {
    return localStorage.getItem("theme") || CONFIG.theme;
  } catch {
    return CONFIG.theme;
  }
}

function ProjectPreview({ project, onOpen }) {
  const previewRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const demo = project.demo;

  useEffect(() => {
    if (!CONFIG.liveThumbs || project.thumb === false || !demo?.url) return;

    const target = previewRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [demo?.url, project.thumb]);

  useEffect(() => {
    const target = previewRef.current;
    if (!target || !visible) return;

    const iframe = target.querySelector("iframe");
    if (!iframe) return;

    const resize = () => {
      iframe.style.transform = `scale(${target.clientWidth / 1280})`;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(target);
    return () => observer.disconnect();
  }, [visible]);

  let content;
  if (demo?.type === "video" && demo.url) {
    content = (
      <video src={demo.url} autoPlay loop muted playsInline />
    );
  } else {
    content = project.image ? (
      <img src={project.image} alt={`${project.title} screenshot`} loading="lazy" />
    ) : (
      <span className="ph">
        {project.title
          .split(" ")
          .map((word) => word[0])
          .join("")
          .slice(0, 3)}
      </span>
    );
  }

  return (
    <div className="preview" ref={previewRef}>
      {content}
      {demo?.url && demo.type !== "video" && CONFIG.liveThumbs && project.thumb !== false && (
        <iframe
          title={`${project.title} live preview`}
          tabIndex={-1}
          aria-hidden="true"
          sandbox="allow-scripts allow-same-origin"
          src={visible ? demo.url : undefined}
          className={loaded ? "on" : ""}
          onLoad={() => setLoaded(true)}
        />
      )}
      {demo?.type === "iframe" && (
        <>
          <button
            className="hit"
            type="button"
            aria-label={`Run live demo of ${project.title}`}
            onClick={() => onOpen(project)}
          />
          <span className="play">Run live demo</span>
        </>
      )}
      {demo?.type === "link" && demo.url && (
        <>
          <a
            className="hit"
            href={demo.url}
            target="_blank"
            rel="noopener"
            aria-label={`Open ${project.title}`}
          />
          <span className="play">Open live site</span>
        </>
      )}
      {project.featured && <span className="badge">Featured</span>}
    </div>
  );
}

function ProjectCard({ project, onOpen }) {
  const demo = project.demo;
  return (
    <article className="card">
      <ProjectPreview project={project} onOpen={onOpen} />
      <div className="body">
        <h3>{project.title}</h3>
        <p>{project.problem}</p>
        <ul className="tags">
          {project.stack.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div className="btns">
          {demo?.type === "iframe" && (
            <button className="btn primary" type="button" onClick={() => onOpen(project)}>
              Live demo
            </button>
          )}
          {demo?.type === "link" && demo.url && (
            <a className="btn primary" href={demo.url} target="_blank" rel="noopener">
              Open live site
            </a>
          )}
          {project.repo && (
            <a className="btn" href={project.repo} target="_blank" rel="noopener">
              Source code
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function useActivity() {
  const [activity, setActivity] = useState({ items: null, status: "loading" });

  useEffect(() => {
    const { max = 6 } = CONFIG.activity || {};
    const username = githubUsername;
    if (!username) {
      setActivity({ items: null, status: "empty" });
      return;
    }

    let active = true;
    const key = `ghfeed2:${username}`;
    const ttl = 30 * 60 * 1000;
    let cached = null;
    try {
      cached = JSON.parse(localStorage.getItem(key));
    } catch {
      cached = null;
    }

    const load = async () => {
      if (cached?.data?.length && Date.now() - cached.t < ttl) {
        if (active) setActivity({ items: cached.data, status: "ready" });
        return;
      }

      try {
        const request = async (path) => {
          const response = await fetch(`https://api.github.com${path}`);
          if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
          return response.json();
        };
        const repos = (await request(`/users/${username}/repos?sort=pushed&per_page=30`))
          .filter((repo) => !repo.fork && !repo.archived)
          .slice(0, max);
        const items = await Promise.all(
          repos.map(async (repo) => {
            let text = repo.description || "Updated this repository";
            let at = repo.pushed_at;
            let href = repo.html_url;
            try {
              const [commit] = await request(`/repos/${repo.full_name}/commits?per_page=1`);
              if (commit) {
                text = commit.commit.message.split("\n")[0];
                at = commit.commit.author?.date || at;
                href = commit.html_url;
              }
            } catch {
              // Keep repository metadata when an individual commit endpoint is unavailable.
            }
            return { repo: repo.name, repoUrl: repo.html_url, text, href, at };
          }),
        );
        items.sort((a, b) => new Date(b.at) - new Date(a.at));
        if (items.length) {
          try {
            localStorage.setItem(key, JSON.stringify({ t: Date.now(), data: items }));
          } catch {
            // The feed remains available when browser storage is disabled.
          }
        }
        if (active) setActivity({ items, status: "ready" });
      } catch {
        if (active) {
          setActivity(
            cached?.data
              ? { items: cached.data, status: "ready" }
              : { items: null, status: "error" },
          );
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return activity;
}

function timeAgo(date) {
  const seconds = (Date.now() - new Date(date)) / 1000;
  if (seconds < 3600) return `${Math.max(1, Math.round(seconds / 60))} min ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} h ago`;
  const days = Math.round(seconds / 86400);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function ActivitySection() {
  const { items, status } = useActivity();
  const profile = (
    <a href={githubProfileUrl} target="_blank" rel="noopener">
      See my GitHub profile
    </a>
  );

  return (
    <section id="activity">
      <div className="wrap">
        <h2>Recent activity</h2>
        <p className="sub">
          Latest commits across my public repositories, pulled live from GitHub.
        </p>
        {items?.length ? (
          <ul className="feed">
            {items.map((item) => (
              <li key={`${item.repo}-${item.at}`}>
                <div className="meta">
                  <a href={item.repoUrl} target="_blank" rel="noopener">
                    {item.repo}
                  </a>
                  <span>Latest commit</span>
                  <time dateTime={item.at}>{timeAgo(item.at)}</time>
                </div>
                <p className="msg">
                  <a href={item.href} target="_blank" rel="noopener">
                    {item.text}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        ) : status === "loading" ? null : (
          <p className="feednote">
            {status === "error"
              ? "Couldn't load activity right now. "
              : "No public repositories yet. "}
            {profile}
          </p>
        )}
      </div>
    </section>
  );
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("All");
  const [expanded, setExpanded] = useState(false);
  const [demo, setDemo] = useState(null);
  const dialogRef = useRef(null);
  const frameRef = useRef(null);

  const projects = useMemo(
    () =>
      CONFIG.projects
        .map((project, index) => ({ ...project, originalIndex: index }))
        .sort(
          (a, b) =>
            Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
            (b.date || "").localeCompare(a.date || "") ||
            a.originalIndex - b.originalIndex,
        ),
    [],
  );

  const allTags = useMemo(
    () => ["All", ...[...new Set(projects.flatMap((project) => project.stack))].sort((a, b) => a.localeCompare(b))],
    [projects],
  );
  const matches = useMemo(
    () =>
      projects.filter(
        (project) =>
          (tag === "All" || project.stack.includes(tag)) &&
          `${project.title} ${project.problem} ${project.stack.join(" ")}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [projects, query, tag],
  );
  const filtering = query.trim() !== "" || tag !== "All";
  const displayedProjects =
    filtering || expanded ? matches : matches.slice(0, PROJECT_LIMIT);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", CONFIG.accent);
    document.documentElement.dataset.theme = theme;
    document.title = `${CONFIG.name} – ${CONFIG.role}`;
  }, [theme]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (demo && !dialog.open) dialog.showModal();
    if (!demo && dialog.open) dialog.close();
  }, [demo]);

  const openDemo = (project) => setDemo(project);
  const closeDemo = () => {
    setDemo(null);
    if (frameRef.current) frameRef.current.src = "about:blank";
  };
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Theme selection still applies for this visit when storage is disabled.
    }
  };

  const navLinks = CONFIG.sections;

  return (
    <>
      <nav>
        <div className="wrap">
          <a className="brand" href="#top">
            ~/{CONFIG.name.toLowerCase().replace(/\s+/g, "-")}
          </a>
          <ul>
            {navLinks.map((section) => (
              <li key={section}>
                <a href={`#${section}`}>
                  {section[0].toUpperCase() + section.slice(1)}
                </a>
              </li>
            ))}
            <li>
              <button
                id="theme"
                type="button"
                aria-label="Toggle light or dark theme"
                onClick={toggleTheme}
              >
                {theme === "dark" ? "☾" : "☀"}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <main id="top">
        <header className="hero">
          <div className="wrap">
            <span className="status">
              <i />
              <span>{CONFIG.status}</span>
            </span>
            <h1>{CONFIG.headline}</h1>
            <p>{CONFIG.pitch}</p>
            <div className="btns">
              {CONFIG.sections.includes("projects") && (
                <a className="btn primary" href="#projects">
                  View projects
                </a>
              )}
              {CONFIG.links.linkedin && (
                <a className="btn" href={CONFIG.links.linkedin} target="_blank" rel="noopener">
                  LinkedIn
                </a>
              )}
              <a className="btn" href={CONFIG.links.github} target="_blank" rel="noopener">
                GitHub
              </a>
            </div>
          </div>
        </header>

        {CONFIG.sections.includes("projects") && (
          <section id="projects">
            <div className="wrap">
              <h2>Projects</h2>
              <p className="sub">
                Browse deployed demos and source code. Interactive previews load as
                needed; projects that simulate sensor readings or hardware controls
                are labeled clearly. The portfolio and all five project showcases
                are built with React 19 and Vite 6.
              </p>
              <div className="tools">
                <input
                  className="search"
                  type="search"
                  placeholder="Search by name, topic or tech"
                  aria-label="Search projects"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <div className="fchips" role="group" aria-label="Filter by technology">
                  {allTags.map((filter) => (
                    <button
                      className="fchip"
                      key={filter}
                      type="button"
                      aria-pressed={tag === filter}
                      onClick={() => setTag(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <p className="count" aria-live="polite">
                {filtering
                  ? `${matches.length} of ${projects.length} projects`
                  : `${projects.length} projects`}
              </p>
              <div className="grid">
                {displayedProjects.map((project) => (
                  <ProjectCard key={project.title} project={project} onOpen={openDemo} />
                ))}
              </div>
              {matches.length === 0 && (
                <p className="empty">
                  No projects match. Clear the search or pick another technology.
                </p>
              )}
              <button
                className="btn"
                id="more"
                type="button"
                hidden={filtering || matches.length <= PROJECT_LIMIT}
                onClick={() => setExpanded((current) => !current)}
              >
                {expanded ? "Show fewer" : `Show all (${matches.length})`}
              </button>
            </div>
          </section>
        )}

        {CONFIG.sections.includes("activity") && <ActivitySection />}

        {CONFIG.sections.includes("skills") && (
          <section id="skills">
            <div className="wrap">
              <h2>Skills</h2>
              <p className="sub">Grouped by what I have used in a project.</p>
              <div className="skills">
                {Object.entries(CONFIG.skills).map(([group, items]) => (
                  <div key={group}>
                    <h3>{group}</h3>
                    <ul className="chips">
                      {items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {CONFIG.sections.includes("about") && (
          <section id="about">
            <div className="wrap about">
              <h2 style={{ marginBottom: 22 }}>About</h2>
              {CONFIG.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p className="learning">{CONFIG.learning}</p>
            </div>
          </section>
        )}

        {CONFIG.sections.includes("contact") && (
          <section id="contact">
            <div className="wrap contact">
              <h2 style={{ marginBottom: 22 }}>Contact</h2>
              <a className="mail" href={`mailto:${CONFIG.links.email}`}>
                {CONFIG.links.email}
              </a>
              <div className="links">
                {Object.entries(CONFIG.links)
                  .filter(([key, value]) => key !== "email" && Boolean(value))
                  .map(([key, value]) => (
                    <a href={value} key={key} target="_blank" rel="noopener">
                      {key[0].toUpperCase() + key.slice(1)}
                    </a>
                  ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer>
        <div className="wrap">© {new Date().getFullYear()} {CONFIG.name}</div>
      </footer>

      <dialog
        ref={dialogRef}
        aria-label="Live demo"
        onClose={() => {
          setDemo(null);
          if (frameRef.current) frameRef.current.src = "about:blank";
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeDemo();
        }}
      >
        {demo && (
          <>
            <div className="dhead">
              <span>{demo.title}</span>
              <div>
                <a className="btn" href={demo.demo.url} target="_blank" rel="noopener">
                  Open in new tab
                </a>
                <button className="btn" type="button" onClick={closeDemo}>
                  Close
                </button>
              </div>
            </div>
            <iframe
              ref={frameRef}
              title="Live demo"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              src={demo.demo.url}
            />
            <div className="dnote">
              If the demo stays blank, the site blocks embedding. Use “Open in new
              tab”.
            </div>
          </>
        )}
      </dialog>
    </>
  );
}

export default App;
