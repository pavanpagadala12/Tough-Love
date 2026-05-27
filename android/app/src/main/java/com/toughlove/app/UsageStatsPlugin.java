package com.toughlove.app;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.provider.Settings;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

@CapacitorPlugin(name = "UsageStats")
public class UsageStatsPlugin extends Plugin {

    @PluginMethod
    public void hasPermission(PluginCall call) {
        AppOpsManager appOps = (AppOpsManager) getContext()
                .getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                getContext().getPackageName()
        );
        JSObject ret = new JSObject();
        ret.put("granted", mode == AppOpsManager.MODE_ALLOWED);
        call.resolve(ret);
    }

    @PluginMethod
    public void openPermissionSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void getTodayUsage(PluginCall call) {
        AppOpsManager appOps = (AppOpsManager) getContext()
                .getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                getContext().getPackageName()
        );
        if (mode != AppOpsManager.MODE_ALLOWED) {
            call.reject("PERMISSION_DENIED");
            return;
        }

        UsageStatsManager usm = (UsageStatsManager) getContext()
                .getSystemService(Context.USAGE_STATS_SERVICE);

        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        long startTime = cal.getTimeInMillis();
        long endTime   = System.currentTimeMillis();

        Map<String, UsageStats> statsMap = usm.queryAndAggregateUsageStats(startTime, endTime);

        PackageManager pm = getContext().getPackageManager();
        JSArray apps = new JSArray();

        // System packages to skip
        List<String> skipPrefixes = new ArrayList<>();
        skipPrefixes.add("com.android.");
        skipPrefixes.add("android.");
        skipPrefixes.add("com.google.android.gms");
        skipPrefixes.add("com.google.android.gsf");
        skipPrefixes.add("com.toughlove.app");

        for (Map.Entry<String, UsageStats> entry : statsMap.entrySet()) {
            String packageName = entry.getKey();
            long   timeMs      = entry.getValue().getTotalTimeInForeground();

            if (timeMs < 5000) continue; // skip < 5 seconds

            boolean skip = false;
            for (String prefix : skipPrefixes) {
                if (packageName.startsWith(prefix)) { skip = true; break; }
            }
            if (skip) continue;

            // Skip system apps (those without a launcher icon / not user-installed)
            try {
                ApplicationInfo info = pm.getApplicationInfo(packageName, 0);
                if ((info.flags & ApplicationInfo.FLAG_SYSTEM) != 0 &&
                    (info.flags & ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) == 0) continue;
            } catch (PackageManager.NameNotFoundException e) {
                continue;
            }

            String appName = packageName;
            try {
                ApplicationInfo appInfo = pm.getApplicationInfo(packageName, 0);
                appName = pm.getApplicationLabel(appInfo).toString();
            } catch (PackageManager.NameNotFoundException ignored) {}

            JSObject app = new JSObject();
            app.put("packageName", packageName);
            app.put("appName", appName);
            app.put("timeMs", timeMs);
            apps.put(app);
        }

        JSObject ret = new JSObject();
        ret.put("apps", apps);
        call.resolve(ret);
    }
}
