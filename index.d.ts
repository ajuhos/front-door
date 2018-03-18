import { OutgoingMessage, IncomingMessage, Server } from 'http';
import { Server as httpsServer } from 'https';
import { Socket } from 'net';
import { SecureContext, SecureContextOptions } from "tls";

declare module 'front-door' {

    export const version: string;

    export class Target {
        constructor(list: TargetList, id: number, href: string, weight?: number, enabled?: boolean);
        weight: number;
        available: boolean;
        enabled: boolean;
    }

    export type BalancingMethod = { name: 'random'|'urlHash'|'roundRobin'|'sourceIpHash' }

    export class TargetList {
        constructor(balancingMethod?: BalancingMethod);

        readonly balancingMethod: any;

        updateItemWeight(target: Target): void;
        updateItemState(target: Target): void;

        add(target: Target): void;
        remove(target: Target): void;
        addMany(targets: Target[]): void;
        findIndex(target: Target, list?: TargetList): void;
        findById(id: number, list?: TargetList): void;
        removeById(id: number): void;
        clear(): void;
        generateBalancer(): void;
        pick(req: OutgoingMessage): Target;

        static balancingMethod: {
            random: BalancingMethod,
            urlHash: BalancingMethod,
            roundRobin: BalancingMethod,
            sourceIpHash: BalancingMethod
        }
    }

    export class Rule {
        constructor(regexp: RegExp);

        regexp: RegExp;
        tlsCredentials: SecureContextOptions;
        tlsSecureContext: SecureContext;

        test(href: string): boolean;
        match(href: string): null|(string[]);

        static fromPattern(pattern: string, arg2?: any, arg3?: any): Rule;
    }

    export class ForwardRule extends Rule {
        constructor(regexp: RegExp, targets: TargetList, credentials?: SecureContextOptions);

        credentials: SecureContextOptions;
        targets: TargetList;

        tryHandle(req: OutgoingMessage, res: IncomingMessage, href: string): boolean;
        tryHandleWebSocket(req: OutgoingMessage, socket: Socket, head: string, href: string): boolean;
    }

    export class RedirectRule extends Rule {
        constructor(regexp: RegExp, href: string);

        href: string;

        tryHandle(req: OutgoingMessage, res: IncomingMessage, href: string): boolean;
        tryHandleWebSocket(): never;
    }

    export class HttpServer extends Server {
        constructor(rules: Rule[])

        rules: Rule[];

        onRequest(req: OutgoingMessage, res: IncomingMessage): void;
        onUpgrade(req: OutgoingMessage, socket: Socket, head: string): void;
    }

    export class HttpsServer extends httpsServer {
        constructor(rules: Rule[])

        rules: Rule[];

        onRequest(req: OutgoingMessage, res: IncomingMessage): void;
        onUpgrade(req: OutgoingMessage, socket: Socket, head: string): void;
    }

}