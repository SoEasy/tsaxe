interface ITsaxeFieldConfig {
  mediator: () => ITsaxeFieldConfig;
  transformer: () => ITsaxeFieldConfig;
}

class TsaxeBaseProxy {
  getCopy() {

  }

  getValue() {

  }

  attachSource
}

class TsaxeProxy {
  // Ключ - класс прокси
  // Значение - класс чистых данных
  private static tsaxeTargetStore = new Map();

  constructor(targetConstructor) {
    return function(target) {
      const originalConstructor = target;

      function construct(constructor: any, args: Array<any>): any {
        // tslint:disable-next-line
        const c: any = function () {
          // tslint:disable-next-line
          return constructor.apply(this, args);
        };

        c.prototype = constructor.prototype;
        return new c();
      }

      const newConstructor = function (initialData) {
        const newInstance = construct(originalConstructor, [initialData]);
        console.log('Мы вклинились в конструктор', initialData);
        return newInstance;
      };

      newConstructor.prototype = originalConstructor.prototype;

      // И сохранить конструктор прокси и его класс данных
      TsaxeProxy.tsaxeTargetStore.set(newConstructor, targetConstructor);

      return newConstructor;
    }
  }
}

class TsaxeField {
  private mediators: Array<ProxyConfigMediator> = [];
  private transformers: Array<ProxyConfigTransformer> = [];
  private isAggregatedProxy: boolean;

  constructor(private targetFieldName?: string) {}

  static Field(targetFieldName?: string): ITsaxeFieldConfig {
    return new TsaxeField(targetFieldName);
  }

  static NesterProxy(targetFieldName?: string): TsaxeProxy {
    const retVal = new TsaxeField(targetFieldName);
    retVal.isAggregatedProxy = true;
    return retVal;
  }

  mediator(mediator: ProxyConfigMediator): TsaxeProxy {
    this.mediators.push(mediator);
    return this;
  }

  transformer(transformer: ProxyConfigTransformer): TsaxeProxy {
    this.transformers.push(transformer);
    return this;
  }
}

class ExampleData {
  firstName: string;
}

@TsaxeProxy(ExampleData)
class ExampleProxy extends TsaxeBaseProxy {
  constructor(initialData) {
    // TODO не знаю зачем давать проксе оригинальный конструктор
    console.log('Оригинальный конструктор', initialData);
  }

  firstName: ITsaxeFieldConfig = TsaxeField.Field().mediator().transformer();
}

const data = new ExampleProxy({firstName: 'hello'});
data.firstName = 'johny';
console.log(TsaxeProxy.tsaxeTargetStore);
