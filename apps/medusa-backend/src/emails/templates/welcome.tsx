import type { ProductDTO } from "@medusajs/framework/types";
import { Heading, Section } from "@react-email/components";
import EmailBody from "../components/email-body";
import Layout from "../components/layout";
import ProductsList from "../components/products-list";
import { title } from "../components/style";

interface WelcomeEmailProps {
  products: ProductDTO[];
}

function Welcome({ products }: WelcomeEmailProps) {
  return (
    <Layout preview="Welcome to SolarEdge Supply!">
      <Section align="left" className="my-20 w-full px-5">
        <Heading className="pb-3" style={title}>
          Welcome to the future of energy!
        </Heading>
        <EmailBody
          paragraphs={[
            "Welcome to SolarEdge Supply - your trusted partner for premium solar panels and equipment! We’re thrilled to have you here and can’t wait to help you harness the power of the sun.",
            "What’s New at SolarEdge Supply?",
            ". High-Efficiency Panels: We carry the latest monocrystalline and polycrystalline panels from top manufacturers.",
            ". Exclusive Offers: Be the first to know about seasonal promotions and bulk order discounts.",
            ". Expert Support: Our team is ready to help you choose the right system for your needs.",
            "Let’s power your home with clean energy!",
          ]}
          signature
        />
        <ProductsList products={products} />
      </Section>
    </Layout>
  );
}

export default function getWelcomeTemplate(props?: WelcomeEmailProps) {
  return <Welcome products={props?.products ?? []} />;
}
