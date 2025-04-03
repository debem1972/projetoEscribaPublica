// Aguarda o DOM carregar para inicializar os componentes
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa os toasts
    const toastElList = document.querySelectorAll(".toast");
    const toastList = [...toastElList].map((toastEl) => {
        const toast = new bootstrap.Toast(toastEl, {});
        // toast.show(); // Descomente se quiser que os toasts apareçam automaticamente
        return toast;
    });

    // Código para a automação do empilhamento de toasts
    const btnToast = document.getElementById("btnToast");
    if (btnToast) {
        btnToast.addEventListener("click", () => {
            const toast = document.getElementById("toast");
            const container = document.getElementById("toastContainer");
            const novoToast = toast.cloneNode(true);
            novoToast.lastElementChild.innerHTML = "Mensagem em " + Date();
            container.appendChild(novoToast);
            const bsToast = new bootstrap.Toast(novoToast, {});
            bsToast.show();
        });
    }

    // Cria os tooltips configurados com o atributo data-bs-toggle="tooltip"
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            trigger: 'hover focus' // Aparece ao passar o mouse ou focar
        });
    });

    // Inicializa os popovers
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    const popoverList = [...popoverTriggerList].map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl));

    // Abrindo o toast por meio de um botão
    const toastTrigger = document.getElementById('liveToastBtn');
    const toastLiveExample = document.getElementById('liveToast');
    if (toastTrigger && toastLiveExample) {
        toastTrigger.addEventListener('click', () => {
            const toast = new bootstrap.Toast(toastLiveExample);
            toast.show();
        });
    }
});