export const UPLOAD_RES_PRESETS = [
  { id: 1, label: "4K UHD", width: 3840, height: 2160, badge: "4K", size: "~2.4 MB" },
  { id: 2, label: "Full HD", width: 1920, height: 1080, badge: "1080p", size: "~680 KB" },
  { id: 3, label: "Ultrawide", width: 3440, height: 1440, badge: "21:9", size: "~1.1 MB" },
  { id: 4, label: "Tablet", width: 2048, height: 2732, badge: "iPad", size: "~1.8 MB" },
  { id: 5, label: "Mobile", width: 1080, height: 1920, badge: "Phone", size: "~520 KB" },
] as const;

export type UploadResPreset = (typeof UPLOAD_RES_PRESETS)[number];
