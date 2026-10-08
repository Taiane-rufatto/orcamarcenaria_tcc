-- D032: nomes de material, serviço e cliente em maiúsculas. Idempotente: só toca no que ainda não está.
-- Material e serviço têm nome único por marcenaria; se dois nomes viram o mesmo ao ficar em maiúsculas
-- (ex.: "mdf" e "MDF"), a migração para sem alterar nada e lista os casos, para a autora decidir qual manter.
-- Itens já incluídos em orçamentos guardam a descrição da época (RN08) e não são alterados.
DO $$
DECLARE colisoes TEXT;
BEGIN
  SELECT string_agg(tabela || ': ' || nomes, E'\n') INTO colisoes FROM (
    SELECT 'material' AS tabela, upper(nome) || ' (' || count(*) || ' cadastros)' AS nomes
      FROM material GROUP BY marcenaria_id, upper(nome) HAVING count(*) > 1
    UNION ALL
    SELECT 'servico', upper(nome) || ' (' || count(*) || ' cadastros)'
      FROM servico GROUP BY marcenaria_id, upper(nome) HAVING count(*) > 1
  ) c;
  IF colisoes IS NOT NULL THEN
    RAISE EXCEPTION E'Nomes que ficariam iguais em maiúsculas; renomeie ou inative antes de migrar:\n%', colisoes;
  END IF;
END $$;

UPDATE material SET nome = upper(nome) WHERE nome <> upper(nome);
UPDATE servico  SET nome = upper(nome) WHERE nome <> upper(nome);
UPDATE cliente  SET nome = upper(nome) WHERE nome <> upper(nome);
