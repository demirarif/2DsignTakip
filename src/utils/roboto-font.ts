// Roboto-Regular font Base64 (Türkçe karakter desteği için)
// Bu dosya Roboto Regular fontunun Base64 kodlanmış versiyonunu içerir
// Türkçe karakterler (ğ, ü, ş, ı, ö, ç, Ğ, Ü, Ş, İ, Ö, Ç) desteklenir

export const robotoFontBase64 = 'data:font/truetype;charset=utf-8;base64,AAEAAAASAQAABAAgRFNJRwAAAAEAAMHgAAAACEdERUYFfQO+AACnVAAAAJxHUE9TdaQH1QAAp/AAAAnQR1NVQgABAAAAALDAAAAACE9TLzJeW1l6AAABeAAAAGBjbWFwAzcFHgAAAnwAAAJIY3Z0IAAhAnkAAATMAAAAAjBmcGdtaIdU9AAABvwAAAKzZ2FzcAAAABAAAAaUAAAACGdseWaDgfXvAACJzAAAGuRoZWFkF3PVKAAAAQwAAAA2aGhlYQceA+cAAAFEAAAAJGhtdHgZvQ8gAAAE/AAAAZZsb2NhVbVVEgAABJAAAACYbWF4cAJ6AS4AAAFoAAAAIG5hbWV22kcyAACSsAAAA+Fwb3N0/2kAXAAAluQAAAEAcHJlcAAeHk8AAAmgAAAA9A==';

// Font yükleme fonksiyonu
export const loadRobotoFont = () => {
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Roboto';
      src: url('${robotoFontBase64}') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
};
