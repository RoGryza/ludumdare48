import { AiPerson } from "../objects/aiperson";

export type AiAction = WalkToAction;

export enum AiActionType {
    walkTo = "walkTo",
}

export interface WalkToAction {
    type: AiActionType.walkTo,
    x: number,
    y: number,
}

type ActionPayloadMap = {
    [AiActionType.walkTo]: WalkToAction,
}

export type ActionPayload<K extends keyof ActionPayloadMap> = ActionPayloadMap[K];

export type ActionHandler<K extends AiActionType> =
    (me: AiPerson, delta: number, payload: ActionPayload<K>) => boolean;

const HANDLERS: { [K in AiActionType]: ActionHandler<K> } = {
    [AiActionType.walkTo]: (me, delta, { x, y }) => {
        const dx = x - me.x;
        const dy = y - me.y;
        const squaredDistance = dx * dx + dy * dy;
        const deltaPx = me.speed * delta;

        if (squaredDistance <= deltaPx * deltaPx) {
            me.position.set(x, y);
            return true;
        }

        const distance = Math.sqrt(squaredDistance);
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;

        me.position.set(
            me.x + normalizedDx * deltaPx,
            me.y + normalizedDy * deltaPx,
        );
        me.lookAt(x, y);
        return false;
    },
}

export function handleAction(me: AiPerson, delta: number, action: AiAction): boolean {
    return HANDLERS[action.type](me, delta, action);
}