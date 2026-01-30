terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# 1. RED Y DNS
resource "aws_route53_zone" "principal" {
  name          = var.dominio_base
  vpc {
    vpc_id = data.aws_vpc.default.id
  }
  force_destroy = true
}

# 2. GRUPOS DE SEGURIDAD (Firewall)
resource "aws_security_group" "bastion" {
  name        = "sg_bastion_pro"
  description = "Permite entrada SSH desde internet"
  vpc_id      = data.aws_vpc.default.id

  # Ingress: SSH (22) desde cualquier lugar
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Egress: Salida a internet (para instalar updates)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "interno_web" {
  name        = "sg_interno_web"
  description = "Seguridad para servidores internos (Frontend, API, Images)"
  vpc_id      = data.aws_vpc.default.id

  # Regla 1: Permitir tráfico HTTP (80) Público (Solo para Frontend realmente)
  # Nota: En prod, esto debería estar separado, pero para este lab lo unificamos para simplificar
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  # Regla 2: SSH SOLO desde el Bastion (Seguridad Máxima)
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }
  
  # Regla 3: Comunicación interna entre ellos (Frontend -> API)
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true # Permite que se hablen entre máquinas de este mismo grupo
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. INSTANCIAS (Servidores)

# --- BASTION ---
resource "aws_instance" "bastion" {
  ami           = data.aws_ami.ubuntu.id # ¡Usa la AMI dinámica!
  instance_type = var.tipo_instancia
  key_name      = var.nombre_clave
  
  vpc_security_group_ids = [aws_security_group.bastion.id]
  user_data              = file("scripts/bastion.sh")
  
  tags = { Name = "Bastion-Host" }
}

# --- API ---
resource "aws_instance" "api" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.tipo_instancia
  key_name      = var.nombre_clave

  vpc_security_group_ids = [aws_security_group.interno_web.id]
  user_data              = file("scripts/api.sh")

  tags = { Name = "Backend-API" }
}

# --- IMAGES ---
resource "aws_instance" "images" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.tipo_instancia
  key_name      = var.nombre_clave

  vpc_security_group_ids = [aws_security_group.interno_web.id]
  user_data              = file("scripts/images.sh")

  tags = { Name = "Backend-Images" }
}

# --- FRONTEND ---
resource "aws_instance" "frontend" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.tipo_instancia
  key_name      = var.nombre_clave

  vpc_security_group_ids = [aws_security_group.interno_web.id]

  # Inyectamos las IPs privadas de API e IMAGES en el script del frontend
  user_data = templatefile("scripts/frontend.sh", {
    api_ip    = aws_instance.api.private_ip
    images_ip = aws_instance.images.private_ip
  })
  
  # Dependencia explícita: Espera a que existan los backends
  depends_on = [aws_instance.api, aws_instance.images]

  tags = { Name = "Frontend-Proxy" }
}

# 4. DNS RECORDS (Route53)
resource "aws_route53_record" "nodos" {
  for_each = {
    "bastion"  = aws_instance.bastion.private_ip
    "frontend" = aws_instance.frontend.private_ip
    "api"      = aws_instance.api.private_ip
    "images"   = aws_instance.images.private_ip
  }

  zone_id = aws_route53_zone.principal.zone_id
  name    = "${each.key}.${var.dominio_base}"
  type    = "A"
  ttl     = 300
  records = [each.value]
}

# 5. OUTPUTS (Información Final)
output "conexion_ssh_bastion" {
  description = "Comando para entrar al Bastion"
  value       = "ssh -i ${var.nombre_clave}.pem ubuntu@${aws_instance.bastion.public_ip}"
}

output "url_frontend" {
  description = "URL Pública del Frontend"
  value       = "http://${aws_instance.frontend.public_ip}"
}

output "pruebas_internas" {
  description = "URLs para probar internamente (desde el Bastion con curl)"
  value = {
    api    = "http://api.${var.dominio_base}"
    images = "http://images.${var.dominio_base}"
  }
}
