for f in *.tga; do
    convert ./"$f" ./"${f%.tga}.pdf"
done