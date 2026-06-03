# Implementação Completa de Upload de Imagens com Editor 1:1

## Objetivo

Remover completamente os campos de URL de imagem do sistema.

Atualmente o sistema solicita:

```jsx
<input type="url" />
```

para:

* Foto de perfil
* Imagem de produto

Isso deve ser substituído por upload real de arquivos.

---

## Stack Atual

Frontend:

```bash
Vite
React
TypeScript
React Query
```

Backend:

```bash
Express
TypeScript
Drizzle ORM
JWT
Cloudinary
```

Cloudinary já está configurado e funcionando.

Os controllers já utilizam:

```ts
cloudinary.uploader.upload(...)
```

---

# O que deve ser implementado

## Perfil do usuário

Na tela de edição do perfil:

Remover:

```jsx
<input
  type="url"
  value={editForm.profileImage}
/>
```

Adicionar:

```jsx
<input
  type="file"
  accept="image/png,image/jpeg,image/webp"
/>
```

Fluxo:

```text
Usuário escolhe imagem
↓
Abre editor
↓
Crop obrigatório 1:1
↓
Preview
↓
Compressão
↓
Upload
↓
Cloudinary
↓
Salvar URL no banco
```

---

## Cadastro de Produtos

Remover:

```jsx
<input
  type="url"
  value={imageUrl}
/>
```

Adicionar:

```jsx
<input
  type="file"
  accept="image/png,image/jpeg,image/webp"
/>
```

Fluxo idêntico:

```text
Selecionar imagem
↓
Editor 1:1
↓
Preview
↓
Compressão
↓
Upload
↓
Cloudinary
↓
Salvar URL
```

---

# Dependências necessárias

Instalar:

```bash
npm install react-easy-crop
npm install browser-image-compression
```

ou

```bash
npm i react-easy-crop browser-image-compression
```

---

# Criar componente reutilizável

Criar:

```text
src/components/ImageCropUpload.tsx
```

Esse componente deve servir para:

* Avatar
* Produtos

---

## Props

```ts
interface ImageCropUploadProps {
  onImageReady: (base64: string) => void;
  preview?: string;
  size?: number;
}
```

---

## Funcionalidades

### Seleção de arquivo

Aceitar:

```text
jpg
jpeg
png
webp
```

---

### Validação

Limite:

```text
5 MB
```

Tipos aceitos:

```ts
[
  "image/jpeg",
  "image/png",
  "image/webp"
]
```

---

### Crop

Usar:

```tsx
<Cropper
  image={selectedImage}
  crop={crop}
  zoom={zoom}
  aspect={1}
  onCropChange={setCrop}
  onZoomChange={setZoom}
  onCropComplete={onCropComplete}
/>
```

Importante:

```tsx
aspect={1}
```

deve ser obrigatório.

---

### Recursos do editor

Permitir:

```text
Zoom
Mover imagem
Preview
```

Não precisa:

```text
Filtros
Texto
Stickers
```

Editor simples.

---

### Compressão

Após crop:

Usar:

```ts
browser-image-compression
```

Exemplo:

```ts
const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1200,
  useWebWorker: true
};

const compressedFile =
  await imageCompression(file, options);
```

Converter para:

```text
WebP
```

quando possível.

---

### Preview

Mostrar:

```jsx
<img
  src={preview}
  alt="preview"
/>
```

---

### Resultado final

Retornar:

```ts
base64
```

para o componente pai.

---

# Backend

Cloudinary já existe.

Não criar nova configuração.

Utilizar a configuração existente.

---

## Auth Controller

Arquivo:

```text
authController.ts
```

Hoje existe:

```ts
const result =
  await cloudinary.uploader.upload(
    profileImage || user.profileImage
  );
```

Isso é incorreto.

Problema:

Sempre faz upload novamente mesmo quando o usuário alterou apenas:

```text
Nome
Email
Telefone
Endereço
```

---

### Corrigir

Implementar:

```ts
let avatarUrl = user.profileImage;

if (
  profileImage &&
  profileImage !== user.profileImage
) {
  const result =
    await cloudinary.uploader.upload(
      profileImage,
      {
        folder: "avatars",
        width: 500,
        height: 500,
        crop: "fill"
      }
    );

  avatarUrl = result.secure_url;
}
```

Depois:

```ts
profileImage: avatarUrl
```

---

## Product Controller

Arquivo:

```text
productController.ts
```

Hoje:

```ts
cloudinary.uploader.upload(imageUrl)
```

é executado em toda atualização.

Corrigir.

---

### Implementar

```ts
let finalImage = existing.imageUrl;

if (
  imageUrl &&
  imageUrl !== existing.imageUrl
) {
  const result =
    await cloudinary.uploader.upload(
      imageUrl,
      {
        folder: "products",
        width: 1000,
        height: 1000,
        crop: "fill"
      }
    );

  finalImage = result.secure_url;
}
```

Depois:

```ts
updatedValues.imageUrl = finalImage;
```

---

# Integração com formulário de Perfil

Substituir completamente o campo:

```jsx
URL da Imagem do Perfil
```

por:

```jsx
<ImageCropUpload
  preview={editForm.profileImage}
  onImageReady={(base64) =>
    setEditForm({
      ...editForm,
      profileImage: base64
    })
  }
/>
```

---

# Integração com formulário de Produtos

Substituir completamente:

```jsx
URL da Imagem do Vape
```

por:

```jsx
<ImageCropUpload
  preview={imageUrl}
  onImageReady={(base64) =>
    setImageUrl(base64)
  }
/>
```

---

# UX esperada

## Avatar

```text
Escolher imagem
↓
Editor abre
↓
Crop 1:1
↓
Preview circular
↓
Salvar
```

---

## Produto

```text
Escolher imagem
↓
Editor abre
↓
Crop 1:1
↓
Preview quadrado
↓
Salvar
```

---

# Resultado esperado

Após implementação:

✅ Sem campos de URL de imagem

✅ Upload real de arquivos

✅ Crop obrigatório 1:1

✅ Compressão automática

✅ Preview antes do envio

✅ Upload para Cloudinary

✅ URL salva no banco

✅ Reutilização do mesmo componente para avatar e produtos

✅ Sem reupload desnecessário para Cloudinary quando apenas outros campos forem alterados

✅ Compatível com Vite + React + TypeScript + Express + Cloudinary já existentes no projeto.
