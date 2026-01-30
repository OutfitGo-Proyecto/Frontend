variable "region" {
  description = "Region de AWS donde desplegar"
  type        = string
  default     = "us-east-1"
}

variable "nombre_clave" {
  description = "Nombre de la clave SSH existente en AWS"
  type        = string
  default     = "vockey"
}

variable "dominio_base" {
  description = "Zona privada de Route53"
  type        = string
  default     = "examenpablo.com"
}

# --- OPTIMIZACIÓN DE COSTES ---
variable "tipo_instancia" {
  description = "Tipo de instancia (t2.micro es gratis 750h/mes)"
  type        = string
  default     = "t2.micro" # Antes t2.large (Muy caro)
}

# Usamos un Data Source para buscar la AMI de Ubuntu automáticamente
# Esto evita que el código se rompa si la AMI antigua deja de existir
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical (Dueño oficial de Ubuntu)

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_vpc" "default" {
  default = true
}
