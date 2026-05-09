const { createApp } = Vue;

createApp({
    data() {
        return {
            step: 1,
            sim: null,
            platform: null,
            os: null,
            app: null,
            sims: [],
            adminLink: "https://5gsieutocdo.com", // Link web admin setup
            // Data
            dataPackages: {},
            platforms: [],
            devices: [],
            apps: {},
            platformNextAppLinks: [],
            showPlatformNext: true // Toggle từ admin
        }
    },
    computed: {
        currentApps() {
            if (!this.os || !this.apps[this.os]) return [];
            return this.apps[this.os].filter(app => !app.platform || app.platform === 'all' || app.platform === this.platform);
        },
        currentTutorial() {
            if (!this.os || !this.currentApps) return [];

            // If app is selected, find it
            if (this.app) {
                const found = this.currentApps.find(a => a.name === this.app);
                return found ? found.steps : [];
            }

            if (this.currentApps.length === 1) {
                return this.currentApps[0].steps || [];
            }

            return [];
        },
        filteredPlatformNextApps() {
            if (!this.showPlatformNext || !this.os) return [];
            
            const osType = this.os.toLowerCase();
            let platformCat = '';
            
            if (osType.includes('android')) platformCat = 'android';
            else if (osType.includes('ios')) platformCat = 'ios';
            else if (osType.includes('win') || osType.includes('pc') || osType.includes('laptop')) platformCat = 'window';
            else if (osType.includes('mac')) platformCat = 'mac';
            else if (osType.includes('linux')) platformCat = 'linux';
            
            return this.platformNextAppLinks.filter(app => {
                 const typeList = app.type.toLowerCase();
                 if (platformCat === 'android') return typeList.includes('android');
                 if (platformCat === 'ios') return typeList.includes('ios') || typeList.includes('ipa');
                 if (platformCat === 'window') return typeList.includes('window');
                 if (platformCat === 'mac') return typeList.includes('mac');
                 if (platformCat === 'linux') return typeList.includes('linux');
                 return false;
            });
        }
    },
    mounted() {
        this.fetchSettings();
        this.fetchPackages();
        this.fetchPlatforms();
        this.fetchDevices();
        this.fetchApps();
        this.fetchPlatformNextApps();
    },
    methods: {
        async fetchSettings() {
            try {
                const response = await fetch(`api/settings.php?t=${Date.now()}`);
                const data = await response.json();
                if (data) {
                    if (data.admin_url) this.adminLink = data.admin_url;
                    if (typeof data.show_platform_next !== 'undefined') {
                        this.showPlatformNext = data.show_platform_next;
                    }
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        },
        async fetchPackages() {
            try {
                const response = await fetch(`api/packages.php?t=${Date.now()}`);
                this.dataPackages = await response.json();

                // Dynamic Sims from keys
                if (this.dataPackages) {
                    this.sims = Object.keys(this.dataPackages).map(key => ({
                        id: key,
                        name: key.charAt(0).toUpperCase() + key.slice(1)
                    }));
                }
            } catch (error) {
                console.error('Error fetching packages:', error);
            }
        },
        async fetchPlatforms() {
            try {
                const response = await fetch(`api/platforms.php?t=${Date.now()}`);
                this.platforms = await response.json();
            } catch (error) {
                console.error('Error fetching platforms:', error);
            }
        },
        async fetchDevices() {
            try {
                const response = await fetch(`api/devices.php?t=${Date.now()}`);
                this.devices = await response.json();
            } catch (error) {
                console.error('Error fetching devices:', error);
            }
        },
        async fetchApps() {
            try {
                const response = await fetch(`api/apps.php?t=${Date.now()}`);
                this.apps = await response.json();
            } catch (error) {
                console.error('Error fetching apps:', error);
            }
        },
        async fetchPlatformNextApps() {
            try {
                const response = await fetch(`https://download.platformnext.dev/config.json?t=${Date.now()}`);
                const data = await response.json();
                if (data && data.data) {
                    this.platformNextAppLinks = data.data.filter(item => item.enabled !== false).map(item => {
                        let link = item.downloadLink;
                        if (link && !link.startsWith('http')) {
                            link = 'https://download.platformnext.dev/' + link;
                        }
                        
                        let niceName = item.type;
                        let icon = "fas fa-download";
                        let colorClass = "bg-surfaceHighlight hover:bg-white/10";
                        
                        if (item.type === 'AndroidPlayStore') { niceName = 'Android (CH Play)'; icon = 'fab fa-google-play'; colorClass = 'bg-green-600 hover:bg-green-700 shadow-green-900/20'; }
                        else if (item.type.toLowerCase().includes('android')) { niceName = 'Android (APK ' + (item.id || '') + ')'; icon = 'fab fa-android'; colorClass = 'bg-green-600 hover:bg-green-700 shadow-green-900/20'; }
                        else if (item.type === 'IOSAppStore') { niceName = 'iOS (App Store)'; icon = 'fab fa-app-store-ios'; colorClass = 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'; }
                        else if (item.type.toLowerCase().includes('ios')) { niceName = 'iOS (TestFlight)'; icon = 'fab fa-apple'; colorClass = 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'; }
                        else if (item.type.toLowerCase().includes('window')) { niceName = 'Windows (PC)'; icon = 'fab fa-windows'; colorClass = 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20'; }
                        else if (item.type.toLowerCase().includes('mac')) { niceName = 'MacOS'; icon = 'fab fa-apple'; colorClass = 'bg-zinc-700 hover:bg-zinc-600 shadow-zinc-900/20 text-white'; }
                        else if (item.type.toLowerCase().includes('ipa')) { niceName = 'iOS (IPA)'; icon = 'fab fa-apple'; colorClass = 'bg-zinc-700 hover:bg-zinc-600 shadow-zinc-900/20 text-white'; }
                        else if (item.type.toLowerCase().includes('linux')) { niceName = 'Linux'; icon = 'fab fa-linux'; colorClass = 'bg-amber-600 hover:bg-amber-700 shadow-yellow-900/20 text-white'; }

                        return {
                            ...item,
                            niceName,
                            icon,
                            colorClass,
                            processedLink: link
                        };
                    });
                }
            } catch (error) {
                console.error('Error fetching platform next apps:', error);
            }
        },
        handlePackageAction(pkg) {
            if (pkg.link) {
                window.open(pkg.link, '_blank');
            } else if (pkg.sms) {
                this.sendSms(pkg.sms.code, pkg.sms.to);
            }
        },
        nextStep() { if (this.step < 6) this.step++; },
        prevStep() { if (this.step > 1) this.step--; },
        openAdmin() { window.open(this.adminLink, '_blank'); },
        selectSim(id) { this.sim = id; },
        selectPlatform(id) { this.platform = id; this.os = null; this.app = null; this.nextStep(); },
        selectOs(id) { this.os = id; this.app = null; },
        selectApp(id) { this.app = id; },
        resetFlow() {
            this.step = 1; this.sim = null; this.platform = null; this.os = null; this.app = null;
        },
        getCurrentPackages() {
            return this.dataPackages[this.sim] || [];
        },
        sendSms(message, recipient) {
            const ua = navigator.userAgent.toLowerCase();
            let separator = '?'; // Standard, Android
            
            if (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1) {
                if (/os [1-7]_/i.test(ua)) {
                    separator = ';'; // iOS <= 7
                } else {
                    separator = '&'; // iOS 8+
                }
            }

            const smsUri = `sms:${recipient}${separator}body=${encodeURIComponent(message)}`;
            window.location.href = smsUri;
        }
    }
}).mount('#app');
