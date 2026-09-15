import { ScrollViewStyleReset } from 'expo-router/html';
import { PropsWithChildren } from 'react';

const backgroundStyle = `
:root {
  color-scheme: only light;
}
html, body, #root {
  background-color: #EAF4FF;
  min-height: 100%;
}
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="data:," />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: backgroundStyle }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
