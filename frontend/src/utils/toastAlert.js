import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: "colored-toast",
  },
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export const toastSuccess = (message) => {
  Toast.fire({
    icon: "success",
    title: message,
    iconColor: "#10b981",
    customClass: {
      title: "text-slate-800 text-[14px] font-medium",
    },
  });
};

export const toastError = (message) => {
  Toast.fire({
    icon: "error",
    title: message,
    iconColor: "#e11d48",
    customClass: {
      title: "text-slate-800 text-[14px] font-medium",
    },
  });
};

export const toastInfo = (message) => {
  Toast.fire({
    icon: "info",
    title: message,
    customClass: {
      title: "text-slate-800 text-[14px] font-medium",
    },
  });
};
