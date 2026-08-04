import { describe, it, expect } from "vitest"
import {
  cn,
  formatPhone,
  phoneFromJID,
  getProfileColor,
  getAvatarColor,
  PROFILE_COLORS,
  AVATAR_COLORS_LIGHT,
  AVATAR_COLORS_DARK,
  formatChatTimestamp,
  formatDateSeparator,
  dayKey,
} from "./utils"

describe("formatPhone", () => {
  it("formats a 12-digit number with country code split", () => {
    expect(formatPhone("918708335596")).toBe("+91 87083 35596")
  })

  it("formats a US-style 11-digit number", () => {
    expect(formatPhone("14155552671")).toBe("+1 41555 52671")
  })

  it("keeps 10 or fewer digits unsplit", () => {
    expect(formatPhone("8708335596")).toBe("+8708335596")
    expect(formatPhone("12345")).toBe("+12345")
    expect(formatPhone("1")).toBe("+1")
  })

  it("returns empty string for empty input", () => {
    expect(formatPhone("")).toBe("")
  })

  it("strips non-digit characters before formatting", () => {
    expect(formatPhone("+91 87083-35596")).toBe("+91 87083 35596")
    expect(formatPhone("(91) 87083.35596")).toBe("+91 87083 35596")
  })

  it("returns empty string when input has no digits", () => {
    expect(formatPhone("abc-def")).toBe("")
    expect(formatPhone("++--")).toBe("")
  })

  it("handles very long numbers without crashing", () => {
    const long = "9".repeat(50)
    const out = formatPhone(long)
    expect(out.startsWith("+")).toBe(true)
    expect(out.endsWith(`${"9".repeat(5)} ${"9".repeat(5)}`)).toBe(true)
  })
})

describe("phoneFromJID", () => {
  it("extracts digits from a phone JID", () => {
    expect(phoneFromJID("918708335596@s.whatsapp.net")).toBe("918708335596")
  })

  it("returns empty string for lid JIDs", () => {
    expect(phoneFromJID("120363404754523806@lid")).toBe("")
  })

  it("returns empty string for group JIDs", () => {
    expect(phoneFromJID("120363404754523806@g.us")).toBe("")
  })

  it("returns empty string for empty input", () => {
    expect(phoneFromJID("")).toBe("")
  })

  it("composes with formatPhone for lid senders (renders nothing)", () => {
    expect(formatPhone(phoneFromJID("120363404754523806@lid"))).toBe("")
  })
})

describe("cn", () => {
  it("merges class values", () => {
    expect(cn("a", false && "b", "c")).toBe("a c")
  })
})

// SHA-1(JID) → pastel palette index (WhatsApp-style default avatars).
describe("getAvatarColor", () => {
  it("returns a color from the light pastel palette", () => {
    const c = getAvatarColor("120363@g.us", false)
    expect(AVATAR_COLORS_LIGHT).toContain(c)
  })

  it("returns a color from the dark pastel palette", () => {
    const c = getAvatarColor("120363@g.us", true)
    expect(AVATAR_COLORS_DARK).toContain(c)
  })

  it("is stable for the same JID", () => {
    expect(getAvatarColor("hello@g.us")).toBe(getAvatarColor("hello@g.us"))
  })

  it("picks different palette slots for light vs dark (same index)", () => {
    const jid = "120363@g.us"
    const light = getAvatarColor(jid, false)
    const dark = getAvatarColor(jid, true)
    const li = AVATAR_COLORS_LIGHT.indexOf(light as (typeof AVATAR_COLORS_LIGHT)[number])
    const di = AVATAR_COLORS_DARK.indexOf(dark as (typeof AVATAR_COLORS_DARK)[number])
    expect(li).toBe(di)
    expect(light).not.toBe(dark)
  })

  it("falls back for empty JID", () => {
    expect(getAvatarColor("")).toBe(AVATAR_COLORS_LIGHT[0])
  })

  it("getProfileColor aliases light palette", () => {
    expect(getProfileColor("hello@g.us")).toBe(getAvatarColor("hello@g.us", false))
    expect(PROFILE_COLORS).toBe(AVATAR_COLORS_LIGHT)
  })
})

describe("dayKey", () => {
  it("extracts YYYY-MM-DD from ISO timestamp", () => {
    expect(dayKey("2026-08-04T12:00:00Z")).toBe("2026-08-04")
    expect(dayKey("2026-01-01T00:00:00.000Z")).toBe("2026-01-01")
  })

  it("returns empty for invalid timestamp", () => {
    expect(dayKey("")).toBe("")
    expect(dayKey("not-a-date")).toBe("")
  })
})

describe("formatDateSeparator", () => {
  it('returns "Today" for today', () => {
    const today = new Date()
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    expect(formatDateSeparator(iso)).toBe("Today")
  })

  it('returns "Yesterday" for yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000)
    const iso = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`
    expect(formatDateSeparator(iso)).toBe("Yesterday")
  })

  it("returns a weekday name for dates this week", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000)
    const iso = `${threeDaysAgo.getFullYear()}-${String(threeDaysAgo.getMonth() + 1).padStart(2, "0")}-${String(threeDaysAgo.getDate()).padStart(2, "0")}`
    const result = formatDateSeparator(iso)
    expect([ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ]).toContain(result)
  })

  it("returns locale date for older dates", () => {
    expect(formatDateSeparator("2024-01-15")).toMatch(/\d/)
  })

  it("returns original string for invalid input", () => {
    expect(formatDateSeparator("")).toBe("")
    expect(formatDateSeparator("abc")).toBe("abc")
  })
})

describe("formatChatTimestamp", () => {
  it("returns time for today's timestamp", () => {
    const now = Math.floor(Date.now() / 1000)
    const result = formatChatTimestamp(now)
    // Locale-dependent time format — contains digits and colon
    expect(result).toMatch(/\d/)
    expect(result).not.toBe("Yesterday")
    expect(result).toContain(":")
  })

  it('returns "Yesterday" for yesterday\'s timestamp', () => {
    const yesterday = Math.floor((Date.now() - 86400000) / 1000)
    expect(formatChatTimestamp(yesterday)).toBe("Yesterday")
  })

  it("returns date string for older timestamps", () => {
    const old = Math.floor(new Date("2024-01-15").getTime() / 1000)
    const result = formatChatTimestamp(old)
    expect(result).toMatch(/\d/)
    expect(result).not.toMatch(/^\d{1,2}:\d{2}$/)
    expect(result).not.toBe("Yesterday")
  })

  it("returns empty string for zero / invalid timestamps", () => {
    expect(formatChatTimestamp(0)).toBe("")
    expect(formatChatTimestamp(NaN)).toBe("")
  })
})
