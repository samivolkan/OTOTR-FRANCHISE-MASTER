import {
  navigationItems,
  referenceRouteOrder,
  referenceScreens,
  routeMetaById
} from "../data/mock-data.js";
import { createPhase2Screen } from "../screens/phase2-screens.js";

const primaryRoutes = Object.freeze({
  splash: "login",
  login: "branch",
  branch: "home",
  password: "login",
  home: "jobs",
  jobs: "job-detail",
  detail: "start-proof",
  start: "tests",
  "start-proof": "start-proof-success",
  "start-proof-success": "tests",
  modules: "lock",
  lock: "moduleControl",
  taskTransfer: "tests",
  permissionDenied: "branch",
  moduleControl: "itemDetail",
  itemDetail: "statusModal",
  statusModal: "camera",
  evidence: "camera",
  camera: "moduleControl",
  photoApproval: "missing",
  photoUploadError: "camera",
  issues: "missing",
  blockingIssues: "summary",
  customerSummary: "customer-summary",
  "customer-summary": "final-report",
  finalReport: "final-report",
  "final-report": "summary",
  approvalWaiting: "summary",
  "approval-waiting": "summary",
  completed: "jobs",
  returned: "missing",
  notifications: "jobs",
  profile: "permissions",
  permissions: "profile",
  offlineSync: "sync-error",
  "offline-sync": "sync-error",
  syncError: "offline-sync",
  "sync-error": "offline-sync",
  emptyState: "jobs",
  "empty-state": "jobs",
  help: "help",
  reports: "reports"
});

const icons = Object.freeze({
  arrowLeft: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10 20a2 2 0 004 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6l1 2h3v15H5V6h3l1-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 10h6M9 14h6M9 18h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4v-9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  missing: '<svg viewBox="0 0 72 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M30 5L58 57H2L30 5Z"/><path d="M30 23V38"/><path d="M30 48H30.5"/><circle cx="56" cy="45" r="16" fill="#fff"/><path d="M48 45L55 52L66 38"/></g></svg>',
  scan: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3H4v4M17 3h3v4M7 21H4v-4M17 21h3v-4M8 12h8M12 8v8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  tasks: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6l1 2h3v15H5V6h3l1-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 11h.01M9 15h.01M12 11h4M12 15h4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  warning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l10 18H2L12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9v5M12 18h.01" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  wrench: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6a4 4 0 015 5l-9 9-4 1 1-4 9-9a4 4 0 01-2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
});

let activeScreenCleanup = null;

export function createShell(activeRoute, onNavigate) {
  activeScreenCleanup?.();
  activeScreenCleanup = null;

  const phase2Screen = createPhase2Screen(activeRoute, onNavigate, { createBottomNav });
  if (phase2Screen) {
    const cleanupTarget = phase2Screen.querySelector("[data-route-cleanup]") ?? phase2Screen.querySelector("main");
    if (typeof cleanupTarget?.ototrCleanup === "function") {
      activeScreenCleanup = cleanupTarget.ototrCleanup;
    }
    return phase2Screen;
  }

  const screen = document.createElement("div");
  screen.className = "app-screen reference-mode";
  screen.append(createReferenceScreen(activeRoute, onNavigate));
  return screen;
}

export function createAppHeader({ title, subtitle = "", showBack = false, showNotification = true } = {}, onNavigate) {
  const header = document.createElement("header");
  header.className = "app-header";

  if (showBack) {
    const backButton = createIconButton("Geri dön", "arrowLeft");
    backButton.addEventListener("click", () => onNavigate?.("home"));
    header.append(backButton);
  } else {
    const spacer = document.createElement("span");
    spacer.className = "app-header-spacer";
    header.append(spacer);
  }

  const copy = document.createElement("div");
  copy.className = "app-header-copy";
  const heading = document.createElement("h1");
  heading.textContent = title ?? "OTOTR Terminal";
  copy.append(heading);

  if (subtitle) {
    const paragraph = document.createElement("p");
    paragraph.textContent = subtitle;
    copy.append(paragraph);
  }

  header.append(copy);

  if (showNotification) {
    const notificationButton = createIconButton("Bildirimler", "bell");
    notificationButton.classList.add("notification-button");
    notificationButton.append(createNotificationBadge("3"));
    notificationButton.addEventListener("click", () => onNavigate?.("notifications"));
    header.append(notificationButton);
  } else {
    const spacer = document.createElement("span");
    spacer.className = "app-header-spacer";
    header.append(spacer);
  }

  return header;
}

export function createBottomNav(activeRoute, onNavigate) {
  const nav = document.createElement("nav");
  nav.className = "bottom-nav-shell bottom-nav";
  nav.setAttribute("aria-label", "Alt navigasyon");

  navigationItems.forEach((item) => {
    const visual = getBottomNavVisual(item);
    const button = document.createElement("button");
    button.type = "button";
    button.className = item.elevated
      ? "bottom-nav-item bottom-nav-center-home nav-button center-home-nav"
      : "bottom-nav-item nav-button";
    button.dataset.route = item.routeId;
    button.setAttribute("aria-label", visual.ariaLabel ?? visual.label ?? item.label);

    if (item.routeId === activeRoute) {
      button.setAttribute("aria-current", "page");
      button.setAttribute("aria-selected", "true");
    }

    const icon = document.createElement("span");
    icon.className = item.elevated ? "nav-icon center-home-icon" : "nav-icon";
    icon.innerHTML = icons[visual.icon] ?? icons.home;

    button.append(icon);

    if (visual.label) {
      const label = document.createElement("span");
      label.className = "nav-label";
      label.textContent = visual.label;
      button.append(label);
    }

    if (visual.badge) {
      const badge = document.createElement("b");
      badge.className = "bottom-nav-badge";
      badge.textContent = visual.badge;
      button.append(badge);
    }

    button.addEventListener("click", () => onNavigate?.(item.routeId));
    nav.append(button);
  });

  return nav;
}

function getBottomNavVisual(item) {
  const visuals = {
    tasks: { label: "G\u00f6revler", icon: "tasks" },
    jobs: { label: "\u0130\u015flerim", icon: "clipboard" },
    home: { label: "OtoTR", ariaLabel: "OtoTR Ana Sayfa", icon: "home" },
    issues: { label: "Eksikler", icon: "missing" },
    profile: { label: "Profil", icon: "user" }
  };
  return visuals[item.id] ?? { label: item.label, icon: item.icon, badge: item.badge };
}

function createBottomNavVisual() {
  const visual = document.createElement("div");
  visual.className = "bottom-nav-visual";
  const image = document.createElement("img");
  image.className = "bottom-nav-approved-image";
  image.src = "./src/assets/approved-nav/bottom_nav_exact_reference_embedded.svg";
  image.alt = "";
  image.setAttribute("aria-hidden", "true");
  visual.append(image);
  return visual;
}

function createNotificationBadge(value) {
  const badge = document.createElement("b");
  badge.className = "notification-badge";
  badge.textContent = value;
  return badge;
}

export function createStatusBadge(label, tone = "neutral") {
  const badge = document.createElement("span");
  badge.className = "status-badge";
  badge.dataset.tone = tone;
  badge.textContent = label;
  return badge;
}

export function createJobCard(workOrder, onNavigate) {
  const card = document.createElement("article");
  card.className = "job-card section-card";

  const title = document.createElement("h3");
  title.textContent = workOrder.işEmriNo;

  const plate = document.createElement("strong");
  plate.textContent = workOrder.plaka;

  const detail = document.createElement("p");
  detail.textContent = `${workOrder.marka} ${workOrder.model} / ${workOrder.yıl}`;

  const meta = document.createElement("p");
  meta.className = "job-card-meta";
  meta.textContent = `${workOrder.bayi} · ${workOrder.müşteriAdı}`;

  const badge = createStatusBadge(workOrder.durum, statusToneFor(workOrder.durum));

  const action = createSecondaryButton("Detayı Gör", () => onNavigate?.("job-detail"));
  action.classList.add("job-card-action");

  card.append(title, plate, detail, meta, badge, action);
  return card;
}

export function createMetricCard({ label, value, tone = "neutral", icon = "clipboard" }) {
  const card = document.createElement("article");
  card.className = `metric-card tone-${tone}`;

  const iconWrap = document.createElement("span");
  iconWrap.className = "metric-card-icon";
  iconWrap.innerHTML = icons[icon] ?? icons.clipboard;

  const valueNode = document.createElement("strong");
  valueNode.textContent = value;

  const labelNode = document.createElement("span");
  labelNode.textContent = label;

  card.append(iconWrap, valueNode, labelNode);
  return card;
}

export function createSectionCard({ title, description = "", children = [] } = {}) {
  const section = document.createElement("section");
  section.className = "section-card";

  if (title) {
    const heading = document.createElement("h2");
    heading.textContent = title;
    section.append(heading);
  }

  if (description) {
    const paragraph = document.createElement("p");
    paragraph.textContent = description;
    section.append(paragraph);
  }

  for (const child of children) {
    if (child) section.append(child);
  }

  return section;
}

export function createPrimaryButton(label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "primary-button";
  button.textContent = label;
  button.addEventListener("click", () => onClick?.());
  return button;
}

export function createSecondaryButton(label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary-button";
  button.textContent = label;
  button.addEventListener("click", () => onClick?.());
  return button;
}

export function createEmptyState({ title, description, primaryAction, secondaryAction } = {}, onNavigate) {
  const empty = document.createElement("section");
  empty.className = "empty-state section-card";

  const icon = document.createElement("span");
  icon.className = "empty-state-icon";
  icon.innerHTML = icons.warning;

  const heading = document.createElement("h2");
  heading.textContent = title ?? "Sonuç bulunamadı";

  const text = document.createElement("p");
  text.textContent = description ?? "Arama kriterlerinizi değiştirerek tekrar deneyebilirsiniz.";

  empty.append(icon, heading, text);

  if (primaryAction) empty.append(createPrimaryButton(primaryAction, () => onNavigate?.("jobs")));
  if (secondaryAction) empty.append(createSecondaryButton(secondaryAction, () => onNavigate?.("jobs")));

  return empty;
}

function createReferenceScreen(activeRoute, onNavigate) {
  const route = referenceScreens[activeRoute] ? activeRoute : "home";
  const imagePath = `${referenceScreens[route]}?v=phase1-34`;
  const previousRoute = getPreviousRoute(route);
  const nextRoute = getNextRoute(route);
  const primaryRoute = primaryRoutes[route] ?? nextRoute;

  const wrap = document.createElement("main");
  wrap.className = "reference-shell";
  wrap.innerHTML = `
    <img class="reference-image" src="${imagePath}" alt="${getRouteTitle(route)} referans ekranı" />
    <div class="reference-flow-hotspots" aria-label="Ekran akışı">
      <button class="hotspot flow-prev" type="button" data-route="${previousRoute}" aria-label="Önceki ekran: ${getRouteTitle(previousRoute)}"></button>
      <button class="hotspot flow-next" type="button" data-route="${nextRoute}" aria-label="Sonraki ekran: ${getRouteTitle(nextRoute)}"></button>
      <button class="hotspot primary-action" type="button" data-route="${primaryRoute}" aria-label="Ana aksiyon: ${getRouteTitle(primaryRoute)}"></button>
    </div>
    <div class="reference-nav-hotspots" aria-label="Alt navigasyon">
      ${navigationItems
        .map((item) => `<button class="hotspot nav-${item.id}" type="button" data-route="${item.routeId}" aria-label="${item.label}"></button>`)
        .join("")}
    </div>
  `;

  wrap.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      const routeId = button.getAttribute("data-route");
      if (routeId && referenceScreens[routeId]) onNavigate(routeId);
    });
  });

  return wrap;
}

function createIconButton(label, iconName) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "plain-icon";
  button.setAttribute("aria-label", label);
  button.innerHTML = icons[iconName] ?? icons.home;
  return button;
}

function getNextRoute(route) {
  const index = referenceRouteOrder.indexOf(route);
  if (index === -1) return "start-proof";
  return referenceRouteOrder[index + 1] ?? "home";
}

function getPreviousRoute(route) {
  const index = referenceRouteOrder.indexOf(route);
  if (index <= 0) return "home";
  return referenceRouteOrder[index - 1];
}

function getRouteTitle(route) {
  return routeMetaById[route]?.title ?? "Ana Sayfa";
}

function statusToneFor(status) {
  if (status.includes("Tamam")) return "success";
  if (status.includes("Bekle") || status.includes("Devam")) return "warning";
  if (status.includes("Onay")) return "neutral";
  return "red";
}
