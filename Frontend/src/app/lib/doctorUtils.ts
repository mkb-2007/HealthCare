/**
 * Resolves doctor profile image URL (Cloudinary HTTPS) from item properties or doctor lookup.
 * Returns undefined if no valid remote URL exists, enabling clean fallback avatars.
 */
export function getDoctorProfileImage(item: any, doctorsList?: any[]): string | undefined {
  if (!item) return undefined;

  // Check explicit profileImageUrl / profileImage / photo / doctorImage on item or nested doctor
  const raw =
    item.profileImageUrl ||
    item.profileImage ||
    item.photo ||
    item.doctorProfileImage ||
    item.doctorImage ||
    item.doctor?.profileImageUrl ||
    item.doctor?.profileImage ||
    item.doctor?.photo ||
    item.doctor?.image;

  if (raw && typeof raw === "string" && raw.trim() !== "") {
    if (raw.startsWith("http")) return raw;
  }

  // Look up doctor in provided doctorsList by doctorId or doctorName
  const doctorId = item.doctorId || item.doctor?.id;
  const targetName = item.doctorName || item.fullName || item.name || item.doctor?.fullName || item.doctor?.name;

  if (doctorsList && doctorsList.length > 0) {
    const matched = doctorsList.find(
      (d: any) =>
        (doctorId && String(d.id) === String(doctorId)) ||
        (targetName && (d.fullName === targetName || d.name === targetName))
    );

    if (matched) {
      const matchedRaw = matched.profileImageUrl || matched.profileImage || matched.photo;
      if (matchedRaw && typeof matchedRaw === "string" && matchedRaw.trim() !== "") {
        if (matchedRaw.startsWith("http")) return matchedRaw;
      }
    }
  }

  return undefined;
}
