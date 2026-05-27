import { registerPlugin } from '@capacitor/core'

const UsageStats = registerPlugin('UsageStats', {
  // Web fallback — returns mock data so the screen works in browser too
  web: {
    async hasPermission() { return { granted: false } },
    async openPermissionSettings() {},
    async getTodayUsage() {
      return {
        apps: [
          { packageName: 'com.instagram.android', appName: 'Instagram', timeMs: 23 * 60 * 1000 },
          { packageName: 'com.zhiliaoapp.musically', appName: 'TikTok',    timeMs: 41 * 60 * 1000 },
          { packageName: 'com.google.android.youtube', appName: 'YouTube', timeMs: 18 * 60 * 1000 },
          { packageName: 'com.twitter.android', appName: 'X (Twitter)',    timeMs: 9  * 60 * 1000 },
        ],
      }
    },
  },
})

export default UsageStats
