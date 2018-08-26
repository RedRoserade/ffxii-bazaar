import localForage from "localforage";
// import { extendPrototype } from "localforage-observable";
// import Observable from "zen-observable";

// const localForage = extendPrototype(lf);

// localForage.newObservable.factory = function(subscribeFn: any) {
//   return new Observable(subscribeFn);
// };

localForage.config({
  name: "ffxii_bazaar",
  version: 1
});

export { localForage };

// export async function waitForValueSet<T = any>(key: string): Promise<T> {
//   await localForage.ready();

//   const obs = localForage.getItemObservable<T>(key, {
//     setItem: true,
//     crossTabChangeDetection: true,
//     changeDetection: true,
//     key: key
//   });

//   return new Promise<T>((resolve, reject) => {
//     const subscription = obs.subscribe({
//       next(value) {
//         console.log("next", value);
//         if (value != null) {
//           resolve(value);
//           subscription.unsubscribe();
//         }
//       },
//       error(err) {
//         console.log("err", err);
//         reject(err);
//         subscription.unsubscribe();
//       }
//     });
//     console.log("sub", subscription);
//   });
// }
