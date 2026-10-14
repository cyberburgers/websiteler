/**
 * Two people editing the panel at once (the counter tablet and the owner's phone, say): a save keeps what
 * the other one saved meanwhile. A save knows what it started from (base) and what it ends with (ours);
 * the store holds what is there now (theirs). Only what changed between base and ours is laid over theirs.
 * Where both changed the very same thing, this save, the newer one, wins.
 *
 * Lists of categories and dishes are matched by id, so a dish added, moved or removed on either side
 * survives the other's save. Other lists (prices, tags, opening hours…) are taken whole from whichever
 * side changed them.
 */

type Json = unknown;
type WithId = { id: string };

/** Compares by content, whatever order the keys were written in. */
function key(value: Json): string {
  return JSON.stringify(value, (_, v) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : v,
  );
}
const same = (a: Json, b: Json) => key(a) === key(b);

const isObject = (v: Json): v is Record<string, Json> => typeof v === "object" && v !== null && !Array.isArray(v);
const isIdList = (v: Json): v is WithId[] =>
  Array.isArray(v) && v.every((x) => isObject(x) && typeof x.id === "string");

function merge(base: Json, ours: Json, theirs: Json): Json {
  if (same(ours, base)) return theirs;
  if (same(theirs, base)) return ours;
  if (isObject(ours) && isObject(theirs)) {
    const b = isObject(base) ? base : {};
    const out: Record<string, Json> = {};
    for (const k of new Set([...Object.keys(theirs), ...Object.keys(ours)])) {
      const v = merge(b[k], ours[k], theirs[k]);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }
  if (isIdList(ours) && isIdList(theirs)) return mergeById(isIdList(base) ? base : [], ours, theirs);
  return ours;
}

function mergeById(base: WithId[], ours: WithId[], theirs: WithId[]): WithId[] {
  const B = new Map(base.map((x) => [x.id, x]));
  const O = new Map(ours.map((x) => [x.id, x]));
  const T = new Map(theirs.map((x) => [x.id, x]));
  const kept = new Map<string, WithId>();
  for (const id of new Set([...T.keys(), ...O.keys()])) {
    const b = B.get(id);
    const o = O.get(id);
    const t = T.get(id);
    if (!b) kept.set(id, (o ?? t)!); // added on one side (both: ours)
    else if (!o) continue; // removed here: removed, even if changed there
    else if (!t) {
      if (!same(o, b)) kept.set(id, o); // removed there but changed here: kept
    } else kept.set(id, merge(b, o, t) as WithId);
  }

  // The order: ours if it was rearranged here, theirs otherwise; anything added on the other side
  // goes in after the entry it followed there.
  const common = (list: WithId[], other: Map<string, WithId>) => list.map((x) => x.id).filter((id) => other.has(id));
  const rearranged = !same(common(base, O), common(ours, B));
  const [first, second] = rearranged ? [ours, theirs] : [theirs, ours];
  const order = first.map((x) => x.id).filter((id) => kept.has(id));
  second.forEach((x, i) => {
    if (!kept.has(x.id) || order.includes(x.id)) return;
    const before = second
      .slice(0, i)
      .reverse()
      .find((p) => order.includes(p.id));
    order.splice(before ? order.indexOf(before.id) + 1 : 0, 0, x.id);
  });
  return order.map((id) => kept.get(id)!);
}

type MenuLike = { menu: { id: string; items: WithId[] }[] };

/**
 * A dish moved to a different category on each side would turn up twice: it stays where this save put it.
 */
function oneOfEach<T extends MenuLike>(merged: T, ours: T): T {
  const where = new Map(ours.menu.flatMap((c) => c.items.map((i) => [i.id, c.id] as const)));
  const seen = new Set<string>();
  const counts = new Map<string, number>();
  for (const c of merged.menu) for (const i of c.items) counts.set(i.id, (counts.get(i.id) ?? 0) + 1);
  return {
    ...merged,
    menu: merged.menu.map((c) => ({
      ...c,
      items: c.items.filter((i) => {
        if ((counts.get(i.id) ?? 0) < 2) return true;
        const home = where.get(i.id);
        if (home ? home !== c.id : seen.has(i.id)) return false;
        seen.add(i.id);
        return true;
      }),
    })),
  };
}

export function mergeEdits<T extends MenuLike>(base: T, ours: T, theirs: T): T {
  return oneOfEach(merge(base, ours, theirs) as T, ours);
}
