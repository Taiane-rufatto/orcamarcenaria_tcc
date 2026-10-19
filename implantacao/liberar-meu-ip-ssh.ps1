<#
.SYNOPSIS
  Libera o SSH (porta 22) da VPS para o IP em que você está agora e tira os IPs antigos.

.DESCRIPTION
  O grupo de segurança da VPS só aceita SSH de um IP (decisão de segurança, diagnóstico da spec 017). Quando o seu IP
  muda (outra rede, o provedor trocou o endereço), o SSH para de funcionar. Este script resolve em um comando:
    1. descobre o seu IP atual (checkip.amazonaws.com, serviço da própria AWS);
    2. acha o grupo de segurança pelo NOME (nenhum ID ou IP fica no repositório, que é público);
    3. LIBERA o IP novo primeiro e só depois remove os /32 antigos da porta 22, para você nunca ficar sem acesso;
    4. nunca mexe nas portas 80 e 443 nem em regras que não sejam um único endereço (/32).

  Precisa do AWS CLI configurado com um usuário que possa alterar regras do grupo de segurança.

.PARAMETER SomenteVer
  Só mostra o que faria, sem alterar nada. Rode assim da primeira vez.

.EXAMPLE
  .\implantacao\liberar-meu-ip-ssh.ps1 -SomenteVer
  .\implantacao\liberar-meu-ip-ssh.ps1
#>
param(
  [switch]$SomenteVer,
  [string]$GrupoDeSeguranca = 'orcamarcenaria-sg',
  [string]$Regiao = 'sa-east-1'
)

$ErrorActionPreference = 'Stop'

# Chama o AWS CLI e para no primeiro erro (o PowerShell não faz isso sozinho com programas externos).
function Aws {
  $saida = & aws @args
  if ($LASTEXITCODE -ne 0) { throw "O AWS CLI falhou (código $LASTEXITCODE): aws $($args -join ' ')" }
  return $saida
}

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
  throw 'AWS CLI não encontrado. Instale em https://aws.amazon.com/cli/ e rode "aws configure".'
}

# 1. Meu IP atual
$meuIp = (Invoke-RestMethod -Uri 'https://checkip.amazonaws.com').ToString().Trim()
if ($meuIp -notmatch '^\d{1,3}(\.\d{1,3}){3}$') { throw "Não consegui descobrir o seu IP (resposta: '$meuIp')." }
$meuCidr = "$meuIp/32"

# 2. Grupo de segurança, pelo nome
$grupoId = (Aws ec2 describe-security-groups --region $Regiao --filters "Name=group-name,Values=$GrupoDeSeguranca" `
  --query 'SecurityGroups[0].GroupId' --output text).Trim()
if (-not $grupoId -or $grupoId -eq 'None') { throw "Grupo de segurança '$GrupoDeSeguranca' não encontrado em $Regiao." }

# 3. Quem está liberado hoje na porta 22
$liberados = @((Aws ec2 describe-security-groups --region $Regiao --group-ids $grupoId `
  --query 'SecurityGroups[0].IpPermissions[?FromPort==`22` && ToPort==`22`].IpRanges[].CidrIp' --output text) -split '\s+' |
  Where-Object { $_ -ne '' })

Write-Host "Seu IP agora:        $meuCidr"
Write-Host "Liberados na porta 22: $(if ($liberados) { $liberados -join ', ' } else { '(ninguém)' })"

if ($liberados -contains $meuCidr) {
  Write-Host 'O seu IP já está liberado. Nada a fazer.' -ForegroundColor Green
  return
}

# Só /32 antigos são removidos: se alguém abriu a porta para uma faixa maior, isso é decisão humana e fica como está.
$antigos = @($liberados | Where-Object { $_ -match '/32$' })

if ($SomenteVer) {
  Write-Host "[somente ver] Liberaria $meuCidr e removeria: $(if ($antigos) { $antigos -join ', ' } else { '(nada)' })" -ForegroundColor Yellow
  return
}

# 4. Primeiro libera o novo, depois remove os antigos: nunca fica um instante sem acesso.
Aws ec2 authorize-security-group-ingress --region $Regiao --group-id $grupoId --protocol tcp --port 22 --cidr $meuCidr | Out-Null
Write-Host "Liberado: $meuCidr" -ForegroundColor Green
foreach ($antigo in $antigos) {
  Aws ec2 revoke-security-group-ingress --region $Regiao --group-id $grupoId --protocol tcp --port 22 --cidr $antigo | Out-Null
  Write-Host "Removido: $antigo"
}
Write-Host 'Pronto. Já pode entrar na VPS por SSH (pode levar alguns segundos para valer).' -ForegroundColor Green
