export function ViewOptions() {

    return `
        <div
            id="view-options-menu"
            class="hidden absolute right-0 top-12 w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 overflow-hidden"
        >

            <div class="px-5 py-4 border-b">
                <h3 class="text-sm font-semibold text-gray-900">
                    View Options
                </h3>

                <p class="text-xs text-gray-500 mt-1">
                    Customize the visible filters.
                </p>
            </div>

            <div
                id="view-options-list"
                class="p-3 space-y-3"
            >

            </div>

            <div class="border-t p-3">
                <button
                    id="reset-view-options"
                    class="w-full py-2 rounded-lg hover:bg-gray-100 text-sm"
                >
                    Reset to Default
                </button>
            </div>

        </div>
    `;
}


const filters = [

    {
        id: "customer",
        label: "Customer",
        visible: true,
    },

    {
        id: "session",
        label: "Session",
        visible: true,
    },

    {
        id: "payment",
        label: "Payment Method",
        visible: true,
    },

    {
        id: "date",
        label: "Date",
        visible: true,
    },

];


export function updateToolbarFilters() {

    filters.forEach(filter => {

        const element = document.querySelector(
            `[data-toolbar-filter="${filter.id}"]`
        );

        if (!element) return;

        element.classList.toggle("hidden", !filter.visible);

    });

}


export function renderViewOptions() {

    const container = document.getElementById("view-options-list");

    if (!container) return;

    container.innerHTML = filters.map(filter => `
    <div class="flex items-center justify-between py-2">

        <div>
            <p class="text-sm font-medium text-gray-800">
                ${filter.label}
            </p>

            <p class="text-xs text-gray-400">
                Show this filter in the toolbar
            </p>
        </div>

        <label class="relative inline-flex items-center cursor-pointer">

            <input
                type="checkbox"
                class="sr-only peer"
                data-filter="${filter.id}"
                ${filter.visible ? "checked" : ""}
            >

            <div
                class="
                    w-11
                    h-6
                    bg-gray-200
                    rounded-full
                    transition-colors
                    peer-checked:bg-lime-500

                    after:content-['']
                    after:absolute
                    after:top-[2px]
                    after:left-[2px]
                    after:bg-white
                    after:border
                    after:border-gray-300
                    after:rounded-full
                    after:h-5
                    after:w-5
                    after:transition-all

                    peer-checked:after:translate-x-5
                    peer-checked:after:border-white
                "
            ></div>

        </label>

    </div>
`).join("");

}


export function initializeViewOptions() {

    const button = document.getElementById("view-options-button");

    const menu = document.getElementById("view-options-menu");

    if (!button || !menu) return;

    button.addEventListener("click",(e)=>{

        e.stopPropagation();

        menu.classList.toggle("hidden");

    });

    document.addEventListener("click",()=>{

        menu.classList.add("hidden");

    });

    menu.addEventListener("click",(e)=>{

        e.stopPropagation();

    });

    const container = document.getElementById("view-options-list");

container?.addEventListener("change", (e) => {

    const checkbox = e.target.closest("[data-filter]");

    if (!checkbox) return;

    const filter = filters.find(
        f => f.id === checkbox.dataset.filter
    );

    if (!filter) return;

    filter.visible = checkbox.checked;

    updateToolbarFilters();

});


const resetButton = document.getElementById("reset-view-options");

resetButton?.addEventListener("click", () => {

    filters.forEach(filter => filter.visible = true);

    renderViewOptions();

    updateToolbarFilters();

});

}
