## Input component

O componente app-input é um campo de entrada de texto projetado para ser utilizado em Reactive Forms no Angular. Ele oferece suporte à aplicação de máscaras, proporcionando uma entrada de dados formatada e validada.

### Exemplo de Uso

```html
<app-input 
    formControlName="username"
    mask="000.000.000-00"/>
```

### Tabela de Entrada

| Propriedade        | Tipo      | Descrição                                             |
|--------------------|-----------|-------------------------------------------------------|
| `formControlName`  | `string`  | Nome do controle do formulário associado ao componente |
| `mask`          | `string`  | Máscara a ser aplicada ao valor de entrada             |

### Tabela de Saída

| Evento            | Tipo                     | Descrição                                          |
|-------------------|--------------------------|----------------------------------------------------|
| ``   | ``   |     |

## Estilo CSS

Este componente pode ser estilizado usando as seguintes classes CSS:

- `.input-component`: Classe para o estilo geral do componente.

## Notas de Versão

- **v1.0.0 (Data)**: Implementação inicial do componente.