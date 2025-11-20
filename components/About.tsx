import { Shield, Award, Zap } from "lucide-react";
import { motion } from "framer-motion";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Security First",
      description:
        "We prioritize the protection of your health data with enterprise-grade encryption and compliance with international healthcare standards.",
    },
    {
      icon: Award,
      title: "Quality Care",
      description:
        "Our platform connects you with certified healthcare professionals dedicated to providing the highest standard of medical care.",
    },
    {
      icon: Zap,
      title: "Modern Technology",
      description:
        "Leveraging cutting-edge technology to make healthcare more accessible, efficient, and patient-centered than ever before.",
    },
  ];

  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              About{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CarePulse
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              CarePulse is revolutionizing healthcare management by bridging
              the gap between patients, healthcare providers, and
              administrators. Our platform is built on the principles of
              security, accessibility, and innovation.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We believe that everyone deserves access to quality healthcare
              tools that are simple to use yet powerful enough to handle complex
              medical workflows. That's why we've created a comprehensive
              platform that serves the entire healthcare ecosystem.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {["HIPAA Compliant", "24/7 Support", "99.9% Uptime", "SOC 2 Certified"].map(
                (badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-primary font-semibold"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {badge}
                  </motion.div>
                )
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
