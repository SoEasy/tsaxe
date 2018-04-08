// Заготовка под декоратор сеттера, ненужная

type TsaxeSetterFunc<T> = (value?: T, name?: string, instance?: any) => T | undefined;

function tsaxe<T>(setterFunc: TsaxeSetterFunc<T>): any {
  return function(target: any, propertyKey: any, descriptor: any) {
    const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {
      configurable: true,
      enumerable: true
    };

    const valueStore = new WeakMap<any, T>();

    const originalGet = descriptor.get || function(): T | undefined {
      return valueStore.get(this as any);
    };
    const originalSet = descriptor.set || function(val: T): void {
      valueStore.set(this, val);
    };

    descriptor.get = originalGet;
    descriptor.set = function(newVal: T): void {
      const currentVal = originalGet.call(this);

      if (newVal !== currentVal) {
        const updatedValue = setterFunc(newVal, propertyKey, this);
        originalSet.call(this, updatedValue || newVal);
      }
    };
    Object.defineProperty(target, propertyKey, descriptor);
    return descriptor;
  }
}

class SomeData {
  @tsaxe<string>((value, name, instance) => { console.log('on set', value, name, instance); })
  firstName: string;
}

class AnotherData extends SomeData {
  @tsaxe<string>(() => { console.log('hello'); })
  lastName: string;
}
const s = new SomeData();
s.firstName = 'vov';
