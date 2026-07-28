import { createIcons, icons } from "lucide";

const dropdowns = {};

export async function loadDropdown({
    api,
    containerId,
    valueField = "id",
    labelField = "name",
    label = "label",
    icon = "circle",
    firstLabel = "All",
    firstValue = "",
    dataKey = "value",
}) {

    const token = localStorage.getItem("pos_token");
        
    const headers = token? { Authorization: `Token ${token}` }: {};
    
    const response = await fetch(`http://127.0.0.1:8000/api/${api}/`,{ headers });

    const responseData = await response.json();
    const data = Array.isArray(responseData) ? responseData : (responseData.results || []);

    const container = document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = `
        <button
            type="button"
            data-${dataKey}="${firstValue}"
            data-label="${firstLabel}"
            class="dropdown-option w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            hover:bg-cyan-50 text-sm"
        >
            <span class="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                <i data-lucide="${icon}" class="w-4 h-4"></i>
            </span>

            ${firstLabel}
        </button>

        ${data.map(item => `
            <button
                type="button"
                data-${dataKey}="${item[valueField]}"
                data-label="${label}${item[labelField]}"
                class="dropdown-option w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                hover:bg-cyan-50 text-sm"
            >
                <span class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <i data-lucide="${icon}" class="w-4 h-4"></i>
                </span>

                ${label}${item[labelField]}
            </button>
        `).join("")}
    `;

    createIcons({ icons });
}


export function initializeDropdown({
    buttonId,
    menuId,
    optionsId,
    labelId,
    chevronId,
    dataKey = "value",
    defaultLabel = "All",
    onChange = () => {},
}) {

    const button = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);
    const options = document.getElementById(optionsId);
    const label = document.getElementById(labelId);
    const chevron = document.getElementById(chevronId);

    if (!button) return;

    button.addEventListener("click", e => {

        e.stopPropagation();

        menu.classList.toggle("hidden");

        chevron?.classList.toggle("rotate-180");

    });

    document.addEventListener("click", () => {

        menu.classList.add("hidden");

        chevron?.classList.remove("rotate-180");

    });

    menu.addEventListener("click", e => e.stopPropagation());

    options.addEventListener("click", (event) => {

    const option = event.target.closest(`[data-${dataKey}]`);

    if (!option) return;

    const value = option.getAttribute(`data-${dataKey}`);
    const selectedLabel = option.getAttribute("data-label");

    label.textContent = selectedLabel;

    menu.classList.add("hidden");
    chevron?.classList.remove("rotate-180");

    onChange(value, option);

});

    dropdowns[buttonId] = {
        label,
        defaultLabel,
        onChange,
    };
}


export function resetDropdown(buttonId) {

    const dropdown = dropdowns[buttonId];

    if (!dropdown) return;

    dropdown.label.textContent = dropdown.defaultLabel;

    dropdown.onChange("", dropdown.defaultLabel);

}


export function resetAllDropdowns() {

    Object.keys(dropdowns).forEach(resetDropdown);

}


