export namespace main {
	
	export class ServiceStats {
	    Requests: number;
	    Errors: number;
	    Bandwidth: number;
	    // Go type: time
	    LastUpdate: any;
	
	    static createFrom(source: any = {}) {
	        return new ServiceStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Requests = source["Requests"];
	        this.Errors = source["Errors"];
	        this.Bandwidth = source["Bandwidth"];
	        this.LastUpdate = this.convertValues(source["LastUpdate"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PeerInfo {
	    id: string;
	    services: Service[];
	    lastSeen: string;
	
	    static createFrom(source: any = {}) {
	        return new PeerInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.services = this.convertValues(source["services"], Service);
	        this.lastSeen = source["lastSeen"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Service {
	    serviceID: string;
	    dockerImage: string;
	    hostPort: string;
	    status: string;
	    startedAt: string;
	    requests: number;
	    errors: number;
	    bandwidth: number;
	    activeConns: number;
	
	    static createFrom(source: any = {}) {
	        return new Service(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.serviceID = source["serviceID"];
	        this.dockerImage = source["dockerImage"];
	        this.hostPort = source["hostPort"];
	        this.status = source["status"];
	        this.startedAt = source["startedAt"];
	        this.requests = source["requests"];
	        this.errors = source["errors"];
	        this.bandwidth = source["bandwidth"];
	        this.activeConns = source["activeConns"];
	    }
	}
	export class NodeSnapshot {
	    services: Service[];
	    peers: PeerInfo[];
	    stats: Record<string, ServiceStats>;
	
	    static createFrom(source: any = {}) {
	        return new NodeSnapshot(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.services = this.convertValues(source["services"], Service);
	        this.peers = this.convertValues(source["peers"], PeerInfo);
	        this.stats = this.convertValues(source["stats"], ServiceStats, true);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class ServiceProfile {
	    name: string;
	    image: string;
	    containerPort: number;
	    env: Record<string, string>;
	    command: string[];
	    recommended: boolean;
	    exposeHTTP: boolean;
	    authRequired: boolean;
	    rateLimitPerMin: number;
	
	    static createFrom(source: any = {}) {
	        return new ServiceProfile(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.image = source["image"];
	        this.containerPort = source["containerPort"];
	        this.env = source["env"];
	        this.command = source["command"];
	        this.recommended = source["recommended"];
	        this.exposeHTTP = source["exposeHTTP"];
	        this.authRequired = source["authRequired"];
	        this.rateLimitPerMin = source["rateLimitPerMin"];
	    }
	}

}

