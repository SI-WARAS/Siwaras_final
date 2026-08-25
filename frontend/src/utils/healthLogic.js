/**
 * Centralized Health Logic for SI-WARAS (Frontend)
 * Defined medical thresholds and status categories
 */

export const HEALTH_THRESHOLDS = {
  BLOOD_PRESSURE: {
    BAHAYA_SYS: 140,
    BAHAYA_DIA: 90,
    WASPADA_SYS: 120,
    WASPADA_DIA: 80,
    RENDAH_SYS: 90,
    RENDAH_DIA: 60,
  },
  BLOOD_SUGAR: {
    BAHAYA: 200,
    WASPADA: 140,
    RENDAH: 70,
  },
  CHOLESTEROL: {
    WASPADA: 200,
    BAHAYA: 240,
  },
  URIC_ACID: {
    MALE_BAHAYA: 7.0,
    FEMALE_BAHAYA: 6.0,
  },
  BMI: {
    SANGAT_KURUS_MAX: 17.0,
    KURUS_MAX: 18.4,
    NORMAL_MAX: 25.0,
    GEMUK_MAX: 27.0,
  },
};

export const getBMIStatus = (bmi, weight, height) => {
  let val = bmi;
  if ((val === null || val === undefined || val === "" || isNaN(val)) && weight && height) {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!isNaN(w) && !isNaN(h) && h > 0) {
      const heightM = h / 100;
      val = w / (heightM * heightM);
    }
  }
  if (val === null || val === undefined || val === "" || isNaN(val)) return null;
  val = parseFloat(val);
  if (val <= 0) return null;

  const formattedVal = val.toFixed(1);

  if (val < HEALTH_THRESHOLDS.BMI.SANGAT_KURUS_MAX) {
    return { category: "Sangat Kurus", status: "bahaya", value: formattedVal };
  }
  if (val <= HEALTH_THRESHOLDS.BMI.KURUS_MAX) {
    return { category: "Kurus", status: "waspada", value: formattedVal };
  }
  if (val <= HEALTH_THRESHOLDS.BMI.NORMAL_MAX) {
    return { category: "Normal", status: "normal", value: formattedVal };
  }
  if (val <= HEALTH_THRESHOLDS.BMI.GEMUK_MAX) {
    return { category: "Gemuk", status: "waspada", value: formattedVal };
  }
  return { category: "Obesitas", status: "bahaya", value: formattedVal };
};

export const getBPStatus = (bp) => {
  if (!bp || typeof bp !== "string") return null;
  const parts = bp.split("/");
  if (parts.length < 2) return null;
  const sys = parseInt(parts[0], 10);
  const dia = parseInt(parts[1], 10);
  if (isNaN(sys) || isNaN(dia)) return null;

  if (
    sys < HEALTH_THRESHOLDS.BLOOD_PRESSURE.RENDAH_SYS ||
    dia < HEALTH_THRESHOLDS.BLOOD_PRESSURE.RENDAH_DIA
  )
    return "rendah";
  if (
    sys >= HEALTH_THRESHOLDS.BLOOD_PRESSURE.BAHAYA_SYS ||
    dia >= HEALTH_THRESHOLDS.BLOOD_PRESSURE.BAHAYA_DIA
  )
    return "bahaya";
  if (
    sys > HEALTH_THRESHOLDS.BLOOD_PRESSURE.WASPADA_SYS ||
    dia > HEALTH_THRESHOLDS.BLOOD_PRESSURE.WASPADA_DIA
  )
    return "waspada";
  return "normal";
};

export const getBSStatus = (bs) => {
  if (bs === null || bs === undefined || bs === "") return null;
  const val = parseFloat(bs);
  if (isNaN(val)) return null;
  if (val < HEALTH_THRESHOLDS.BLOOD_SUGAR.RENDAH) return "rendah";
  if (val >= HEALTH_THRESHOLDS.BLOOD_SUGAR.BAHAYA) return "bahaya";
  if (val >= HEALTH_THRESHOLDS.BLOOD_SUGAR.WASPADA) return "waspada";
  return "normal";
};

export const getCholesterolStatus = (chol) => {
  if (chol === null || chol === undefined || chol === "") return null;
  const val = parseFloat(chol);
  if (isNaN(val)) return null;
  if (val >= HEALTH_THRESHOLDS.CHOLESTEROL.BAHAYA) return "bahaya";
  if (val >= HEALTH_THRESHOLDS.CHOLESTEROL.WASPADA) return "waspada";
  return "normal";
};

export const getUAStatus = (ua, gender) => {
  if (ua === null || ua === undefined || ua === "") return null;
  const val = parseFloat(ua);
  if (isNaN(val)) return null;
  const threshold =
    gender === "MALE"
      ? HEALTH_THRESHOLDS.URIC_ACID.MALE_BAHAYA
      : HEALTH_THRESHOLDS.URIC_ACID.FEMALE_BAHAYA;
  if (val > threshold) return "bahaya";
  if (val > threshold - 1) return "waspada";
  return "normal";
};

export const isRiskCase = (record, gender) => {
  const bpStatus = getBPStatus(record.bloodPressure);
  const bsStatus = getBSStatus(record.bloodSugar);
  const cholStatus = getCholesterolStatus(record.cholesterol);
  const uaStatus = getUAStatus(record.uricAcid, gender);

  return (
    bpStatus === "bahaya" ||
    bsStatus === "bahaya" ||
    cholStatus === "bahaya" ||
    uaStatus === "bahaya"
  );
};
