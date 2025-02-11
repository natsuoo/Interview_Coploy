/*
  # Criação da tabela de candidatos e configuração de segurança

  1. Nova Tabela
    - `candidatos`
      - `id` (uuid, chave primária)
      - `nome` (texto, não nulo)
      - `email` (texto, não nulo, único)
      - `telefone` (texto, não nulo)
      - `linkedin_url` (texto, opcional)
      - `created_at` (timestamp com timezone, padrão: now())
      - `user_id` (uuid, não nulo, referência à auth.users)

  2. Segurança
    - Habilita RLS na tabela
    - Adiciona políticas para:
      - Inserção: apenas usuários autenticados
      - Leitura: apenas o próprio usuário
      - Atualização: apenas o próprio usuário
*/

-- Criação da tabela
CREATE TABLE IF NOT EXISTS candidatos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  telefone text NOT NULL,
  linkedin_url text,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

-- Habilita RLS
ALTER TABLE candidatos ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem inserir seus próprios dados"
  ON candidatos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem ler seus próprios dados"
  ON candidatos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios dados"
  ON candidatos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);