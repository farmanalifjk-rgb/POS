let tooltip = null;

function getTooltip() {
  if (tooltip) return tooltip;

  tooltip = document.createElement("div");
  tooltip.id = "global-tooltip";

  tooltip.className = `
    fixed
    z-[99999]
    pointer-events-none
    bg-white
    text-slate-900
    text-sm
    font-medium
    px-3
    py-2
    rounded-lg
    shadow-xl
    whitespace-nowrap
    opacity-0
    transition-all
    duration-150
  `;

  document.body.appendChild(tooltip);

  return tooltip;
}

export function showTooltip(text, element) {
  const tip = getTooltip();

  tip.textContent = text;

  const rect = element.getBoundingClientRect();

  tip.style.left = `${rect.right + 12}px`;
  tip.style.top = `${rect.top + rect.height / 2}px`;
  tip.style.transform = "translateY(-50%)";

  requestAnimationFrame(() => {
    tip.style.opacity = "1";
    tip.style.transform = "translateY(-50%) translateX(0)";
  });
}

export function hideTooltip() {
  if (!tooltip) return;

  tooltip.style.opacity = "0";
  tooltip.style.transform = "translateY(-50%) translateX(-6px)";
}